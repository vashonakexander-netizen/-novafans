import { Metadata } from "next";
import { notFound } from "next/navigation";
import api from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  try {
    const creator = await api.get(`/creators/${params.username}`).then((res) => res.data).catch(() => null);

    if (!creator) {
      return {
        title: "Creator Not Found | NovaFans",
      };
    }

    const description = creator.creatorProfile?.bio || `Subscribe to ${creator.displayName} on NovaFans for exclusive content`;
    const imageUrl = creator.creatorProfile?.headerImageUrl || creator.creatorProfile?.avatarUrl || "";

    return {
      title: `${creator.displayName} (@${creator.username}) | NovaFans`,
      description,
      openGraph: {
        title: `${creator.displayName} on NovaFans`,
        description,
        images: imageUrl ? [imageUrl] : [],
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: `${creator.displayName} on NovaFans`,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Creator Profile | NovaFans",
    };
  }
}

export default async function CreatorProfilePage({
  params,
}: {
  params: { username: string };
}) {
  let creator: any = null;
  let posts: any[] = [];

  try {
    const creatorRes = await api.get(`/creators/${params.username}`);
    creator = creatorRes.data;

    if (creator?.creatorProfile?.id) {
      const postsRes = await api.get(`/posts/creators/${creator.id}/posts`).catch(() => ({ data: [] }));
      posts = Array.isArray(postsRes.data) ? postsRes.data : [];
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      notFound();
    }
    console.error("Error fetching creator:", error);
  }

  if (!creator) {
    notFound();
  }

  const profile = creator.creatorProfile || {};
  const isActive = profile.isActive || false;
  const basePrice = Number(profile.baseSubPrice || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      {profile.headerImageUrl && (
        <div className="h-64 w-full bg-gray-200">
          <img
            src={profile.headerImageUrl}
            alt={`${creator.displayName} header`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 -mt-20 relative">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatarUrl || "/default-avatar.png"}
                alt={creator.displayName}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
              />
              {isActive && (
                <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{creator.displayName}</h1>
              <p className="text-gray-600 mb-4">@{creator.username}</p>
              {profile.bio && (
                <p className="text-gray-700 mb-4 whitespace-pre-line">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div>
                  <div className="text-2xl font-bold">{basePrice > 0 ? `$${basePrice.toFixed(2)}` : "Free"}</div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </div>

              {/* Subscribe Button */}
              <button
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                onClick={async () => {
                  // This will be handled by client-side component
                  alert("Subscribe functionality - implement client-side subscription flow");
                }}
              >
                {basePrice > 0 ? `Subscribe for $${basePrice.toFixed(2)}/mo` : "Follow"}
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Posts</h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No posts yet. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((post: any) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {post.media && post.media.length > 0 && (
                    <img
                      src={post.media[0].fileUrl}
                      alt={post.title || "Post"}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    {post.title && <h3 className="font-semibold mb-2">{post.title}</h3>}
                    {post.body && (
                      <p className="text-gray-600 text-sm line-clamp-3">{post.body}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
