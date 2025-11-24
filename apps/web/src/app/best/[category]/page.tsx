import { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = decodeURIComponent(params.category);
  const title = `Best ${category} Creators | NovaFans`;
  const description = `Discover the best ${category} creators on NovaFans. Top-rated creators with exclusive content.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function BestCategoryPage({ params }: PageProps) {
  const category = decodeURIComponent(params.category);

  // TODO: Fetch top creators by category from API
  const creators: any[] = []; // Placeholder

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Best {category.charAt(0).toUpperCase() + category.slice(1)} Creators
          </h1>
          <p className="text-gray-400 mb-8">
            Discover the top-rated {category} creators on NovaFans. Subscribe for exclusive content
            and support your favorite creators.
          </p>

          {creators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No creators found in this category yet.</p>
              <Link
                href="/creators"
                className="text-red-600 hover:text-red-700 mt-4 inline-block"
              >
                Browse All Creators
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator, index) => (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.username}`}
                  className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition relative"
                >
                  {index < 3 && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                  )}
                  <img
                    src={creator.creatorProfile?.avatarUrl || "/placeholder-avatar.png"}
                    alt={creator.displayName}
                    className="w-20 h-20 rounded-full mb-4"
                  />
                  <h3 className="text-xl font-bold mb-2">{creator.displayName}</h3>
                  <p className="text-gray-400 text-sm mb-4">@{creator.username}</p>
                  <p className="text-red-600 font-semibold">
                    ${Number(creator.creatorProfile?.baseSubPrice || 0).toFixed(2)}/month
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

