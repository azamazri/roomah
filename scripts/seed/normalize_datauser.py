#!/usr/bin/env python3
"""
Normalize datauser.csv to match cv_data table structure
"""

import csv
import json
from datetime import datetime
from typing import Optional

# Province mapping (nama → id)
PROVINCE_MAP = {
    'Aceh': 1,
    'Bali': 2,
    'Banten': 3,
    'Bengkulu': 4,
    'DI Yogyakarta': 5,
    'DKI Jakarta': 6,
    'Gorontalo': 7,
    'Jambi': 8,
    'Jawa Barat': 9,
    'Jawa Tengah': 10,
    'Jawa Timur': 11,
    'Kalimantan Barat': 12,
    'Kalimantan Selatan': 13,
    'Kalimantan Tengah': 14,
    'Kalimantan Timur': 15,
    'Kalimantan Utara': 16,
    'Kepulauan Bangka Belitung': 17,
    'Kepulauan Riau': 18,
    'Lampung': 19,
    'Maluku': 20,
    'Maluku Utara': 21,
    'Nusa Tenggara Barat': 22,
    'Nusa Tenggara Timur': 23,
    'Papua': 24,
    'Papua Barat': 25,
    'Papua Barat Daya': 26,
    'Papua Pegunungan': 27,
    'Papua Selatan': 28,
    'Papua Tengah': 29,
    'Riau': 30,
    'Sulawesi Barat': 31,
    'Sulawesi Selatan': 32,
    'Sulawesi Tengah': 33,
    'Sulawesi Tenggara': 34,
    'Sulawesi Utara': 35,
    'Sumatera Barat': 36,
    'Sumatera Selatan': 37,
    'Sumatera Utara': 38,
    'Luar Negeri': 39,  # Added manually by user
}

# Education mapping
EDUCATION_MAP = {
    'SMA/SMK': 'SMA_SMK',
    'D3': 'D3',
    'S1': 'S1',
    'S2': 'S2',
    'S3': 'S3',
}

# Marital status mapping
MARITAL_MAP = {
    'Single': 'SINGLE',
    'Janda': 'JANDA',
    'Duda': 'DUDA',
}

# Income bracket mapping
INCOME_MAP = {
    'Saat Taaruf': 'SAAT_TAARUF',
    '0-2 Juta': '0_2',
    '2-5 Juta': '2_5',
    '5-10 Juta': '5_10',
    '10+ Juta': '10_PLUS',
}


def parse_date(date_str: str) -> Optional[str]:
    """Convert MM/DD/YYYY to YYYY-MM-DD"""
    if not date_str or date_str.strip() == '':
        return None
    
    try:
        # Parse MM/DD/YYYY or M/D/YYYY
        dt = datetime.strptime(date_str.strip(), '%m/%d/%Y')
        return dt.strftime('%Y-%m-%d')
    except ValueError:
        try:
            # Try alternative format
            dt = datetime.strptime(date_str.strip(), '%d/%m/%Y')
            return dt.strftime('%Y-%m-%d')
        except:
            print(f"⚠️  Warning: Invalid date format: {date_str}")
            return None


def get_province_id(province_name: str) -> Optional[int]:
    """Map province name to ID"""
    province = province_name.strip()
    return PROVINCE_MAP.get(province)


def normalize_education(edu: str) -> Optional[str]:
    """Normalize education to database enum"""
    return EDUCATION_MAP.get(edu.strip(), None)


def normalize_marital_status(status: str) -> Optional[str]:
    """Normalize marital status to database enum"""
    return MARITAL_MAP.get(status.strip(), 'SINGLE')


def normalize_income(income: str) -> str:
    """Normalize income bracket to database enum"""
    return INCOME_MAP.get(income.strip(), 'SAAT_TAARUF')


def normalize_disease_history(disease: str) -> str:
    """Convert disease history to JSON array"""
    disease = disease.strip()
    if not disease or disease.lower() in ['tidak ada', '-', '']:
        return '["Tidak ada"]'
    return json.dumps([disease])


def clean_name(name: str) -> str:
    """Clean name field - remove extra quotes and whitespace"""
    name = name.strip()
    # Remove leading/trailing quotes
    name = name.strip('"').strip("'")
    # Remove extra quotes
    name = name.replace('"""', '').replace('""', '')
    return name.strip()


def fix_height(height: str, weight: str) -> int:
    """Fix obvious height errors"""
    try:
        h = int(height)
        w = int(weight)
        
        # If height is less than 100 and around weight, likely swapped or typo
        if h < 100:
            # Likely missing a digit (56 → 156)
            if 40 <= h <= 90:
                return 150 + (h % 10)  # 56 → 156
        
        return h
    except:
        return 160  # Default


def normalize_address(address_from_csv: str, province_name: str) -> str:
    """Normalize address - use CSV value or generate placeholder"""
    address = address_from_csv.strip()
    
    # If empty or "Tidak ada", generate placeholder
    if not address or address.lower() in ['tidak ada', '-', '']:
        if province_name == 'Luar Negeri':
            return 'Alamat di luar negeri (belum dilengkapi)'
        return f'Alamat lengkap di {province_name} (belum dilengkapi)'
    
    return address


def normalize_row(row: dict) -> Optional[dict]:
    """Normalize one row of data"""
    # Skip empty rows
    if not row.get('email') or row['email'].strip() == '':
        return None
    
    email = row['email'].strip()
    gender = row['Jenis Kelamin'].strip()
    full_name = clean_name(row['Nama Lengkap'])
    birth_date = parse_date(row['Tanggal Lahir '])
    province_name = row['daerah provinsi'].strip()
    province_id = get_province_id(province_name)
    education = normalize_education(row['Pendidikan Terakhir'])
    occupation = row['Pekerjaan'].strip()
    income_bracket = normalize_income(row['Penghasilan per Bulan'])
    weight_kg = int(row['Berat (kg)']) if row['Berat (kg)'].strip() else 50
    height_cm = fix_height(row['Tinggi (cm)'], row['Berat (kg)'])
    marital_status = normalize_marital_status(row['Status Pernikahan'])
    full_address = normalize_address(row.get('full_address', ''), province_name)
    ciri_fisik = row['Ciri Fisik'].strip() if row['Ciri Fisik'].strip() else 'Tidak ada deskripsi'
    disease_history = normalize_disease_history(row['Riwayat Penyakit'])
    
    # Validation
    if not email or not gender or not full_name:
        print(f"⚠️  Skipping row: missing required fields for {email}")
        return None
    
    if gender not in ['IKHWAN', 'AKHWAT']:
        print(f"⚠️  Warning: Invalid gender for {email}: {gender}")
        return None
    
    if not education:
        print(f"⚠️  Warning: Invalid education for {email}: {row['Pendidikan Terakhir']}")
        education = 'S1'  # Default
    
    return {
        'user_email': email,
        'gender': gender,
        'full_name': full_name,
        'birth_date': birth_date,
        'province_id': province_id,
        'education': education,
        'occupation': occupation,
        'income_bracket': income_bracket,
        'height_cm': height_cm,
        'weight_kg': weight_kg,
        'marital_status': marital_status,
        'full_address': full_address,
        'ciri_fisik': ciri_fisik,
        'disease_history': disease_history,
    }


def generate_sql(normalized_data: list) -> str:
    """Generate SQL INSERT statements"""
    sql_lines = [
        "-- =====================================================",
        "-- Import CV Data from datauser.csv",
        f"-- Total records: {len(normalized_data)}",
        "-- Generated: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "-- =====================================================",
        "",
        "-- Insert cv_data records",
        "INSERT INTO public.cv_data (",
        "  user_email, gender, full_name, birth_date, province_id,",
        "  education, occupation, income_bracket, height_cm, weight_kg,",
        "  marital_status, full_address, ciri_fisik, disease_history",
        ") VALUES"
    ]
    
    values = []
    for row in normalized_data:
        province = f"{row['province_id']}" if row['province_id'] else "NULL"
        birth_date = f"'{row['birth_date']}'" if row['birth_date'] else "NULL"
        
        # Escape single quotes in strings
        full_name = row['full_name'].replace("'", "''")
        occupation = row['occupation'].replace("'", "''")
        full_address = row['full_address'].replace("'", "''")
        ciri_fisik = row['ciri_fisik'].replace("'", "''")
        
        value = f"""  (
    '{row['user_email']}', '{row['gender']}', '{full_name}', {birth_date}, {province},
    '{row['education']}', '{occupation}', '{row['income_bracket']}', {row['height_cm']}, {row['weight_kg']},
    '{row['marital_status']}', '{full_address}', '{ciri_fisik}', '{row['disease_history']}'::jsonb
  )"""
        values.append(value)
    
    sql_lines.append(',\n'.join(values))
    sql_lines.append(";")
    sql_lines.append("")
    sql_lines.append("-- Verify insertion")
    sql_lines.append("SELECT COUNT(*) as total_imported FROM public.cv_data;")
    
    return '\n'.join(sql_lines)


def main():
    print("🔄 Normalizing datauser.csv...")
    
    # Read CSV
    with open('uploaded_file_datauser_csv.txt', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"📊 Total rows in CSV: {len(rows)}")
    
    # Normalize data
    normalized_data = []
    skipped = 0
    luar_negeri_count = 0
    
    for i, row in enumerate(rows, 1):
        normalized = normalize_row(row)
        if normalized:
            normalized_data.append(normalized)
            if normalized['province_id'] == 39:
                luar_negeri_count += 1
        else:
            skipped += 1
    
    print(f"✅ Successfully normalized: {len(normalized_data)} rows")
    print(f"⚠️  Skipped (empty/invalid): {skipped} rows")
    print(f"🌍 Users with 'Luar Negeri' (province_id=39): {luar_negeri_count}")
    
    # Generate SQL
    sql = generate_sql(normalized_data)
    
    # Write SQL file
    with open('import_datauser.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"✅ SQL file generated: import_datauser.sql")
    print("\n📋 Summary:")
    print(f"   - Total valid records: {len(normalized_data)}")
    print(f"   - Ready to import to database")
    print(f"\n🚀 Next: Run this SQL in Supabase SQL Editor!")


if __name__ == '__main__':
    main()
