# Backend Server Actions Usage Guide

This guide shows how to use the newly implemented server actions in React components.

---

## 🔐 Authentication

### Register New User

```typescript
"use client";

import { registerUser } from "@/features/auth/server/actions";
import { useState } from "react";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(formData: FormData) {
    setLoading(true);
    setError("");
    
    try {
      const result = await registerUser({
        email: formData.get("email"),
        phone: formData.get("phone"), // Format: +6281234567890, 081234567890, or 6281234567890
        password: formData.get("password"),
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        gender: formData.get("gender"), // "male" or "female"
      });

      if (result.success) {
        console.log("Registered! User ID:", result.userId);
        // Redirect to OTP verification
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleRegister}>
      {/* Form fields */}
    </form>
  );
}
```

### Login User

```typescript
"use client";

import { loginUser } from "@/features/auth/server/actions";

async function handleLogin(email: string, password: string) {
  try {
    const result = await loginUser({ email, password });
    
    if (result.success) {
      console.log("Logged in!", result.firstName);
      // Store session tokens
      // sessionStorage.setItem('accessToken', result.session.accessToken);
    }
  } catch (err: any) {
    console.error("Login failed:", err.message);
  }
}
```

### Verify OTP

```typescript
"use client";

import { requestOtp, verifyOtp } from "@/features/auth/server/actions";

// Step 1: Request OTP
async function requestUserOtp(email: string) {
  try {
    const result = await requestOtp({ email });
    console.log(result.message); // "OTP telah dikirim..."
  } catch (err: any) {
    console.error(err.message);
  }
}

// Step 2: Verify OTP
async function verifyUserOtp(email: string, otp: string) {
  try {
    const result = await verifyOtp({ email, otp });
    console.log("OTP verified!"); // Now user can login
  } catch (err: any) {
    console.error(err.message); // "OTP tidak valid" or "OTP telah kadaluarsa"
  }
}
```

---

## 👤 Profile Management

### Get User Profile

```typescript
"use client";

import { getProfile } from "@/features/auth/server/profile";
import { useEffect, useState } from "react";

export function ProfileView({ userId }: { userId: string }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const result = await getProfile(userId);
        setProfile(result.data);
      } catch (err) {
        console.error("Failed to load profile");
      }
    }
    
    fetchProfile();
  }, [userId]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profile.firstName} {profile.lastName}</h1>
      <p>Email: {profile.email}</p>
      <p>Status: {profile.accountStatus}</p>
      <p>OTP Verified: {profile.otpVerified ? "Yes" : "No"}</p>
    </div>
  );
}
```

### Update Profile

```typescript
"use client";

import { updateProfile } from "@/features/auth/server/profile";

async function updateUserProfile(userId: string, updates: any) {
  try {
    const result = await updateProfile(userId, {
      firstName: "John",
      lastName: "Doe",
      birthDate: new Date("1990-01-15").toISOString(),
      gender: "male",
      city: "Jakarta",
      provinceId: "prov-001",
      bio: "Looking for...",
    });

    console.log(result.message); // "Profil berhasil diperbarui"
  } catch (err: any) {
    console.error(err.message);
  }
}
```

### Check Profile Completion

```typescript
"use client";

import { checkProfileCompletion } from "@/features/auth/server/profile";

async function checkCompletion(userId: string) {
  const result = await checkProfileCompletion(userId);
  
  console.log("Phone Verified:", result.data.phoneVerified);
  console.log("Email Verified:", result.data.emailVerified);
  console.log("CV Approved:", result.data.cvApproved);
  console.log("5Q Completed:", result.data.fiveqCompleted);
  console.log("Is Approved:", result.data.isApproved);
  console.log("Missing Steps:", result.data.missingSteps); // ["cv_data", "fiveq"]
}
```

---

## 📄 CV Management

### Get All CV Data

```typescript
"use client";

import { getCvData } from "@/features/cv/server/actions";

async function loadCvData(userId: string) {
  const result = await getCvData(userId);
  
  console.log(result.data);
  // Output:
  // {
  //   education: [...],
  //   work: [...],
  //   skills: [...],
  //   certification: [...],
  //   language: [...],
  //   project: [...]
  // }
}
```

### Create CV Item

```typescript
"use client";

import { createCvItem } from "@/features/cv/server/actions";

async function addEducation(userId: string) {
  try {
    const result = await createCvItem(userId, {
      category: "education",
      title: "Bachelor of Computer Science",
      description: "Graduated from XYZ University with honors",
      data: {
        school: "XYZ University",
        year: "2020",
        gpa: "3.8"
      },
      isVisible: true,
    });

    console.log("Created with ID:", result.data.id);
  } catch (err: any) {
    if (err.code === "CV_MAX_ITEMS_EXCEEDED") {
      console.error("Max 10 items per category");
    }
  }
}
```

### Update CV Item

```typescript
"use client";

import { updateCvItem } from "@/features/cv/server/actions";

async function updateEducation(userId: string, itemId: string) {
  const result = await updateCvItem(userId, itemId, {
    title: "Bachelor of Computer Science (Updated)",
    description: "New description",
    // Only updated fields are sent - others unchanged
  });

  console.log(result.message);
}
```

### Reorder CV Items

```typescript
"use client";

import { reorderCvItems } from "@/features/cv/server/actions";

async function reorderItems(userId: string) {
  const result = await reorderCvItems(userId, {
    items: [
      { id: "cv-item-1", displayOrder: 1 },
      { id: "cv-item-2", displayOrder: 2 },
      { id: "cv-item-3", displayOrder: 3 },
    ]
  });

  console.log(result.message);
}
```

---

## 🔍 Candidates Browsing

### List Approved Candidates

```typescript
"use client";

import { listApprovedCandidates } from "@/features/candidates/server/list";
import { useState } from "react";

export function CandidateBrowser({ userId }: { userId: string }) {
  const [candidates, setCandidates] = useState([]);

  async function loadCandidates(page: number = 0) {
    try {
      const result = await listApprovedCandidates(userId, {
        limit: 20,
        offset: page * 20,
        gender: "female", // Optional filter
        provinceId: "prov-001", // Optional filter
        ageMin: 20, // Optional
        ageMax: 35, // Optional
        sortBy: "recent", // or "active" or "matched"
      });

      setCandidates(result.data.candidates);

      // Pagination info
      console.log("Total:", result.data.pagination.total);
      console.log("Has More:", result.data.pagination.hasMore);
    } catch (err) {
      console.error("Failed to load candidates");
    }
  }

  return (
    <div>
      {candidates.map(candidate => (
        <div key={candidate.id}>
          <h3>{candidate.firstName} {candidate.lastName}</h3>
          <p>Age: {candidate.age}, {candidate.city}</p>
          <p>{candidate.bio}</p>
        </div>
      ))}
    </div>
  );
}
```

### Get Candidate Profile with CV

```typescript
"use client";

import { getCandidateProfile } from "@/features/candidates/server/list";

async function viewCandidateProfile(userId: string, candidateId: string) {
  try {
    const result = await getCandidateProfile(userId, candidateId);
    
    console.log(result.data);
    // {
    //   id, firstName, lastName, age, gender, city, province, bio, profileImageUrl,
    //   cv: {
    //     education: [...],
    //     work: [...],
    //     skills: [...]
    //   }
    // }
  } catch (err: any) {
    console.error(err.message); // "Kandidat tidak ditemukan"
  }
}
```

### Get Taaruf Requests

```typescript
"use client";

import { 
  getMyTaarufRequests,
  getIncomingTaarufRequests 
} from "@/features/candidates/server/list";

// Outbound requests (requests I sent)
async function getOutbound(userId: string) {
  const result = await getMyTaarufRequests(userId);
  console.log(result.data);
  // [
  //   {
  //     id, candidateId, candidateName, profileImageUrl,
  //     status: "pending" | "accepted" | "rejected",
  //     sentAt, respondedAt
  //   }
  // ]
}

// Inbound requests (requests I received)
async function getInbound(userId: string) {
  const result = await getIncomingTaarufRequests(userId);
  console.log(result.data);
  // [
  //   {
  //     id, senderId, senderName, profileImageUrl, gender, city,
  //     message, receivedAt
  //   }
  // ]
}
```

---

## 🪙 Wallet & Payments

### Get Wallet Balance

```typescript
"use client";

// Note: Implement in features/koin/server/actions.ts
// Pseudocode for reference:

async function getWalletBalance(userId: string) {
  try {
    const result = await supabase
      .rpc("calculate_wallet_balance", { user_id: userId });
    
    console.log("Balance:", result.data, "coins");
  } catch (err) {
    console.error("Failed to fetch balance");
  }
}
```

---

## ⚠️ Error Handling

All server actions throw `AppError` with specific error codes:

```typescript
"use client";

import { loginUser } from "@/features/auth/server/actions";
import { ERROR_CODES } from "@/lib/api/error";

async function handleLogin(email: string, password: string) {
  try {
    const result = await loginUser({ email, password });
  } catch (err: any) {
    switch (err.code) {
      case ERROR_CODES.AUTH_INVALID_CREDENTIALS:
        console.error("Email atau password salah");
        break;
      case ERROR_CODES.AUTH_OTP_EXPIRED:
        console.error("Silakan verifikasi OTP terlebih dahulu");
        break;
      case ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS:
        console.error("Akun Anda telah dibekukan atau dihapus");
        break;
      case ERROR_CODES.RATE_LIMIT_EXCEEDED:
        console.error("Terlalu banyak percobaan. Coba lagi nanti");
        break;
      default:
        console.error(err.message);
    }
  }
}
```

---

## 📋 Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `AUTH_INVALID_CREDENTIALS` | Wrong email/password | Show login form error |
| `AUTH_EMAIL_ALREADY_EXISTS` | Email registered | Suggest login |
| `AUTH_OTP_EXPIRED` | OTP incorrect or expired | Request new OTP |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `PROFILE_NOT_FOUND` | User doesn't exist | Handle gracefully |
| `CV_MAX_ITEMS_EXCEEDED` | 10 items per category limit | Show warning |
| `TAARUF_INELIGIBLE` | User not approved | Show onboarding progress |
| `PAYMENT_INSUFFICIENT_BALANCE` | Not enough coins | Suggest topup |

---

## 🧪 Testing Server Actions

```typescript
// example.test.ts
import { registerUser, loginUser } from "@/features/auth/server/actions";

describe("Auth Actions", () => {
  it("should register a new user", async () => {
    const result = await registerUser({
      email: "test@example.com",
      phone: "081234567890",
      password: "SecurePassword123",
      firstName: "John",
      lastName: "Doe",
      gender: "male",
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBeDefined();
  });

  it("should reject duplicate email", async () => {
    await expect(
      registerUser({
        email: "duplicate@example.com",
        // ... other fields
      })
    ).rejects.toThrow("AUTH_EMAIL_ALREADY_EXISTS");
  });
});
```

---

## 💡 Best Practices

1. **Always validate input** - Server actions use Zod schemas
2. **Handle errors gracefully** - Show user-friendly Indonesian messages
3. **Use try-catch blocks** - Server actions throw on validation failure
4. **Check result.success** - Some actions return status flag
5. **Store sensitive tokens carefully** - Use secure storage (httpOnly cookies preferred)
6. **Respect rate limiting** - Especially for OTP requests
7. **Verify ownership** - Never trust client-provided IDs

---

## 🔗 Related Documentation

- [Database Schema](../01-DATABASE-SCHEMA-DESIGN.md)
- [RLS Policies](../02-RLS-POLICIES-DESIGN.md)
- [Error Codes Reference](../lib/api/error.ts)
- [Backend Progress](../PHASE2-BACKEND-PROGRESS.md)
