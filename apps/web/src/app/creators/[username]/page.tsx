import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: {
    username: string;
  };
}

async function getCreator(username: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/creators/${username}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const creator = await getCreator(params.username);

  if (!creator) {
    return {
      title: "Creator Not Found",
    };
  }

  const title = `${creator.displayName} (@${creator.username}) | NovaFans`;
  const description =
    creator.creatorProfile?.bio ||
    `Subscribe to ${creator.displayName} on NovaFans for exclusive content.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: creator.creatorProfile?.avatarUrl
        ? [creator.creatorProfile.avatarUrl]
        : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: creator.creatorProfile?.avatarUrl
        ? [creator.creatorProfile.avatarUrl]
        : [],
    },
  };
}

export default async function CreatorPage({ params }: PageProps) {
  const creator = await getCreator(params.username);

  if (!creator) {
    notFound();
  }

  const subscriptionPrice = creator.creatorProfile?.baseSubPrice || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Image */}
          {creator.creatorProfile?.headerImageUrl && (
            <div className="w-full h-64 mb-8 rounded-lg overflow-hidden">
              <img
                src={creator.creatorProfile.headerImageUrl}
                alt={creator.displayName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Profile Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="flex-shrink-0">
              <img
                src={creator.creatorProfile?.avatarUrl || "/placeholder-avatar.png"}
                alt={creator.displayName}
                className="w-32 h-32 rounded-full border-4 border-gray-800"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{creator.displayName}</h1>
              <p className="text-gray-400 text-lg mb-4">@{creator.username}</p>
              {creator.creatorProfile?.bio && (
                <p className="text-gray-300 mb-6">{creator.creatorProfile.bio}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/signup?redirect=/creators/${creator.username}`}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold text-center transition"
                >
                  Subscribe for ${subscriptionPrice.toFixed(2)}/month
                </Link>
                <Link
                  href={`/login?redirect=/creators/${creator.username}`}
                  className="border border-gray-600 hover:border-gray-500 text-white px-8 py-3 rounded-lg font-semibold text-center transition"
                >
                  Login to Subscribe
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {creator.creatorProfile?.subscriberCount || 0}
              </div>
              <div className="text-gray-400 text-sm mt-2">Subscribers</div>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {creator.creatorProfile?.postCount || 0}
              </div>
              <div className="text-gray-400 text-sm mt-2">Posts</div>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                ${subscriptionPrice.toFixed(2)}
              </div>
              <div className="text-gray-400 text-sm mt-2">Per Month</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Join {creator.displayName}&apos;s Community</h2>
            <p className="text-gray-400 mb-6">
              Get exclusive content, direct messages, and support your favorite creator.
            </p>
            <Link
              href={`/signup?redirect=/creators/${creator.username}`}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold inline-block transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

