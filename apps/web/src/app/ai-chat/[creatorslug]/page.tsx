import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: {
    creatorslug: string;
  };
}

async function getCreator(creatorslug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/creators/${creatorslug}`, {
      next: { revalidate: 3600 },
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
  const creator = await getCreator(params.creatorslug);

  if (!creator) {
    return {
      title: "Creator Not Found",
    };
  }

  const title = `Chat with ${creator.displayName}'s AI | NovaFans`;
  const description = `Preview ${creator.displayName}'s AI persona. Subscribe to chat directly with ${creator.displayName}.`;

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

export default async function AIChatPage({ params }: PageProps) {
  const creator = await getCreator(params.creatorslug);

  if (!creator) {
    notFound();
  }

  // TODO: Fetch AI persona preview from API
  const aiPersona = creator.creatorProfile?.aiPersona || {
    systemPrompt: "I'm a friendly creator who loves connecting with fans!",
  };

  // Sample preview conversation
  const previewMessages = [
    {
      role: "user",
      content: "Hey! What kind of content do you create?",
    },
    {
      role: "assistant",
      content: aiPersona.systemPrompt?.substring(0, 200) || "I create amazing content for my fans!",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <img
              src={creator.creatorProfile?.avatarUrl || "/placeholder-avatar.png"}
              alt={creator.displayName}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold">{creator.displayName}</h1>
              <p className="text-gray-400">AI Chat Preview</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Preview Conversation</h2>
            <div className="space-y-4">
              {previewMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    msg.role === "user" ? "bg-gray-800 ml-8" : "bg-red-900/30 mr-8"
                  }`}
                >
                  <p className="text-sm text-gray-400 mb-1">
                    {msg.role === "user" ? "You" : creator.displayName}
                  </p>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ This is a preview. Subscribe to chat directly with {creator.displayName}!
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/signup?redirect=/creators/${creator.username}`}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold inline-block transition"
            >
              Subscribe to Chat with {creator.displayName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

