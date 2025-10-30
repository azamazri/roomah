"use server";

import { createClient } from "@/server/db/client";

/**
 * Toggle CV visibility in candidate cards
 */
export async function toggleCvVisibility(isVisible: boolean) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const { error } = await supabase
      .from("cv_data")
      .update({ is_visible: isVisible })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error toggling CV visibility:", error);
      return {
        success: false,
        error: "Failed to update visibility",
      };
    }

    return {
      success: true,
      isVisible,
    };
  } catch (error) {
    console.error("Error toggling CV visibility:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle visibility",
    };
  }
}

/**
 * Get CV visibility status
 */
export async function getCvVisibility() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { isVisible: true }; // Default
    }

    const { data, error } = await supabase
      .from("cv_data")
      .select("is_visible")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return { isVisible: true }; // Default
    }

    return {
      isVisible: data.is_visible ?? true,
    };
  } catch (error) {
    console.error("Error getting CV visibility:", error);
    return { isVisible: true }; // Default
  }
}

/**
 * Submit social media posting request (costs 5 koin)
 */
export async function submitSocialMediaPost() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Check if CV is approved
    const { data: cvData, error: cvError } = await supabase
      .from("cv_data")
      .select("status")
      .eq("user_id", user.id)
      .single();

    if (cvError || !cvData) {
      return {
        success: false,
        error: "CV not found. Please create your CV first.",
      };
    }

    if (cvData.status !== "APPROVED") {
      return {
        success: false,
        error: "CV must be approved before submitting to social media",
      };
    }

    // Check if already have pending or posted request
    const { data: existingPost } = await supabase
      .from("social_media_posts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingPost) {
      if (existingPost.status === "PENDING") {
        return {
          success: false,
          error: "You already have a pending social media post request",
        };
      } else if (existingPost.status === "POSTED") {
        return {
          success: false,
          error: "Your CV has already been posted to social media",
        };
      }
    }

    // Check koin balance (balance in cents, 1 koin = 100 cents)
    const { data: balanceData } = await supabase
      .rpc("get_wallet_balance", { p_user_id: user.id });

    const balance = balanceData ?? 0;
    const requiredBalance = 500; // 5 koin = 500 cents

    if (balance < requiredBalance) {
      return {
        success: false,
        error: "Insufficient koin balance. You need 5 koin to post to social media.",
      };
    }

    // Deduct 5 koin (500 cents) using wallet_transactions
    const orderId = `SOCMED-${user.id}-${Date.now()}`;
    const { error: deductError } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: user.id,
        type: "DEBIT",
        amount_cents: 500,
        reason: "SOCIAL_MEDIA_POST",
        linked_order_id: null,
        idempotency_key: orderId,
      });

    if (deductError) {
      console.error("Error deducting koin:", deductError);
      return {
        success: false,
        error: "Failed to deduct koin",
      };
    }

    // Create social media post request
    const { error: postError } = await supabase
      .from("social_media_posts")
      .insert({
        user_id: user.id,
        status: "PENDING",
      });

    if (postError) {
      console.error("Error creating social media post:", postError);
      // Try to refund koin
      await supabase
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          type: "CREDIT",
          amount_cents: 500,
          reason: "REFUND",
          linked_order_id: null,
          idempotency_key: `refund-${orderId}`,
        });
      
      return {
        success: false,
        error: "Failed to submit social media post request",
      };
    }

    return {
      success: true,
      message: "Successfully submitted! Your CV will be posted to social media soon.",
    };
  } catch (error) {
    console.error("Error submitting social media post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit request",
    };
  }
}

/**
 * Get social media post status for current user
 */
export async function getSocialMediaPostStatus() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { status: null, postedAt: null };
    }

    const { data, error } = await supabase
      .from("social_media_posts")
      .select("status, posted_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) {
      return { status: null, postedAt: null };
    }

    return {
      status: data.status,
      postedAt: data.posted_at,
    };
  } catch (error) {
    console.error("Error getting social media post status:", error);
    return { status: null, postedAt: null };
  }
}

/**
 * ADMIN: Get all pending social media posts
 */
export async function adminGetPendingSocialMediaPosts() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
        posts: [],
      };
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

    if (!profile?.is_admin) {
      return {
        success: false,
        error: "Unauthorized - Admin only",
        posts: [],
      };
    }

    // Get pending posts
    const { data: posts, error } = await supabase
      .from("social_media_posts")
      .select("*")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending posts:", error);
      return {
        success: false,
        error: "Failed to fetch pending posts",
        posts: [],
      };
    }

    if (!posts || posts.length === 0) {
      return {
        success: true,
        posts: [],
      };
    }

    // Get user profiles for all posts
    const userIds = posts.map(p => p.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, gender")
      .in("user_id", userIds);

    // Get CV data for all posts
    const { data: cvData } = await supabase
      .from("cv_data")
      .select("user_id, candidate_code, status")
      .in("user_id", userIds);

    // Merge data
    const enrichedPosts = posts.map(post => {
      const profile = profiles?.find(p => p.user_id === post.user_id);
      const cv = cvData?.find(c => c.user_id === post.user_id);

      return {
        ...post,
        profiles: profile ? {
          id: profile.user_id,
          full_name: profile.full_name || "-",
          email: profile.email || "-",
          gender: profile.gender || "M",
        } : null,
        cv_data: cv ? {
          kode_kandidat: cv.candidate_code || "-",
          status: cv.status || "DRAFT",
        } : null,
      };
    });

    return {
      success: true,
      posts: enrichedPosts,
    };
  } catch (error) {
    console.error("Error getting pending posts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get pending posts",
      posts: [],
    };
  }
}

/**
 * ADMIN: Approve social media post
 */
export async function adminApproveSocialMediaPost(postId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Update post status to POSTED
    const { error } = await supabase
      .from("social_media_posts")
      .update({
        status: "POSTED",
        posted_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (error) {
      console.error("Error approving post:", error);
      return {
        success: false,
        error: "Failed to approve post",
      };
    }

    return {
      success: true,
      message: "Postingan berhasil disetujui",
    };
  } catch (error) {
    console.error("Error approving post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve post",
    };
  }
}

/**
 * ADMIN: Reject social media post and refund koin
 */
export async function adminRejectSocialMediaPost(postId: string, reason?: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Get post data first
    const { data: post, error: getError } = await supabase
      .from("social_media_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (getError || !post) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    // Refund 5 koin (500 cents) to user
    // Add created_at to bypass RLS constraint
    const refundOrderId = `SOCMED-REFUND-${postId}-${Date.now()}`;
    const { error: refundError } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: post.user_id,
        type: "CREDIT",
        amount_cents: 500,
        reason: "REFUND",
        linked_order_id: null,
        idempotency_key: refundOrderId,
        created_at: new Date().toISOString(),
      });

    if (refundError) {
      console.error("Error refunding koin:", refundError);
      return {
        success: false,
        error: "Gagal mengembalikan koin",
      };
    }

    // Update post status to REJECTED
    const { error: updateError } = await supabase
      .from("social_media_posts")
      .update({
        status: "REJECTED",
      })
      .eq("id", postId);

    if (updateError) {
      console.error("Error rejecting post:", updateError);
      return {
        success: false,
        error: "Failed to reject post",
      };
    }

    return {
      success: true,
      message: "Postingan ditolak dan koin dikembalikan",
    };
  } catch (error) {
    console.error("Error rejecting post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject post",
    };
  }
}
