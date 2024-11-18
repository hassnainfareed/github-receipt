"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReceipt = async () => {
    if (!username) return;
    setLoading(true);
    try {
      // Get user data and repos in parallel for better performance
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
      ]);

      const data = await userResponse.json();
      const reposData = await reposResponse.json();

      // Calculate repository stats
      const totalStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);
      const totalForks = reposData.reduce((acc: number, repo: any) => acc + repo.forks_count, 0);

      // Get unique languages and sort by usage
      const languages = reposData
        .reduce((acc: { [key: string]: number }, repo: any) => {
          // Skip if no language or null
          if (!repo.language) return acc;

          // Count occurrences of each language
          acc[repo.language] = (acc[repo.language] || 0) + 1;
          return acc;
        }, {});

      // Sort languages by frequency but only display the names
      const sortedLanguages = Object.entries(languages)
        .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
        .map(([language]) => language);

      const allLanguages = sortedLanguages.join(", ") || "None";

      // Debug languages
      console.log('Languages breakdown:', languages);
      console.log('Sorted languages:', sortedLanguages);

      // Get recent activity for most active day
      const eventsResponse = await fetch(
        `https://api.github.com/users/${username}/events/public`
      );
      const eventsData = await eventsResponse.json();

      // Calculate most active day from available events
      const dayCount = eventsData.reduce((acc: any, event: any) => {
        const day = format(new Date(event.created_at), 'EEEE');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      const mostActiveDay = Object.entries(dayCount).length > 0
        ? Object.entries(dayCount)
          .sort(([, a]: any, [, b]: any) => b - a)[0][0]
        : format(new Date(), "EEEE");

      // Calculate recent commits from push events
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const commitCount = eventsData
        .filter((event: any) =>
          event.type === 'PushEvent' &&
          new Date(event.created_at) > thirtyDaysAgo
        )
        .reduce((acc: number, event: any) =>
          acc + (event.payload.commits?.length || 0), 0);

      // Inside generateReceipt function, before calculating contributionScore:
      console.log('Debug values:', {
        repos: data.public_repos,
        stars: totalStars,
        forks: totalForks,
        followers: data.followers,
        languages: Object.keys(languages).length,
        commits: commitCount
      });

      // Calculation breakdown with authentic weights
      const contributionScore = Math.round(
        // Core activity metrics
        (data.public_repos * 2) +          // Base points for each repository
        (totalStars * 3) +                 // Stars are important social proof
        (totalForks * 2) +                 // Forks show code reuse

        // Social impact
        (data.followers * 1) +             // Followers show influence

        // Code diversity
        (Object.keys(languages).length * 5) + // Language diversity

        // Recent activity
        (commitCount * 2) +                // Recent commits show active coding

        // Bonus multipliers
        (totalStars > 1000 ? 500 : 0) +   // Bonus for 1000+ stars
        (data.followers > 100 ? 300 : 0) + // Bonus for 100+ followers
        (data.public_repos > 50 ? 200 : 0) // Bonus for 50+ repos
      );

      setUserData({
        ...data,
        totalStars,
        totalForks,
        allLanguages,
        contributionScore,
        mostActiveDay: mostActiveDay || "Not enough data",
        commitCount: commitCount || 0
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const generateRandomOrder = () => Math.floor(Math.random() * 90000) + 10000;
  const generateRandomCoupon = () => Math.random().toString(36).substring(2, 8).toUpperCase();
  const generateRandomAuth = () => Math.floor(Math.random() * 900000) + 100000;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-[2.75rem] font-bold text-[#1a1a1a] mb-2">GitHub Receipt</h1>
          <p className="text-[#666666] text-lg">
            Generate a receipt-style summary of your GitHub profile
          </p>
        </div>

        <div className="flex gap-3 mb-12 max-w-md mx-auto">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username"
            className="flex-1 px-6 py-4 text-lg border border-[#e5e5e5] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#4477ff] shadow-sm"
          />
          <button
            onClick={generateReceipt}
            disabled={loading}
            className="px-8 py-4 bg-[#4477ff] text-white rounded-xl text-lg font-medium hover:bg-[#3366ee] focus:outline-none focus:ring-2 focus:ring-[#4477ff] focus:ring-offset-2 disabled:opacity-50 shadow-sm"
          >
            Generate
          </button>
        </div>

        {userData && (
          <div className="max-w-[380px] mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 font-mono text-sm relative receipt-edge">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-1">GITHUB RECEIPT</h2>
                <p className="text-[#666666] mb-1">{format(new Date(), "EEEE, MMMM dd, yyyy").toUpperCase()}</p>
                <p className="text-[#666666]">ORDER #{generateRandomOrder()}</p>
              </div>

              <div className="mb-6">
                <p className="font-bold">CUSTOMER: {userData.name || username}</p>
                <p className="text-[#666666]">@{userData.login}</p>
              </div>

              <div className="border-t border-b border-[#eaeaea] py-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span>REPOSITORIES</span>
                  <span className="font-bold">{userData.public_repos}</span>
                </div>
                <div className="flex justify-between">
                  <span>STARS EARNED</span>
                  <span className="font-bold">{userData.totalStars}</span>
                </div>
                <div className="flex justify-between">
                  <span>REPO FORKS</span>
                  <span className="font-bold">{userData.totalForks}</span>
                </div>
                <div className="flex justify-between">
                  <span>FOLLOWERS</span>
                  <span className="font-bold">{userData.followers}</span>
                </div>
                <div className="flex justify-between">
                  <span>FOLLOWING</span>
                  <span className="font-bold">{userData.following}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="font-bold mb-1">LANGUAGES:</p>
                <p className="break-words">{userData.allLanguages}</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-1">
                  <span className="font-bold">MOST ACTIVE DAY:</span>
                  <span>{userData.mostActiveDay}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>COMMITS (30d):</span>
                  <span>{userData.commitCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">CONTRIBUTION SCORE:</span>
                  <span>{userData.contributionScore}</span>
                </div>
              </div>

              <div className="text-center mb-6 text-[#666666]">
                <p>Served by: GitHub Bot</p>
                <p>{format(new Date(), "hh:mm:ss a")}</p>
              </div>

              <div className="text-center mb-6">
                <p className="font-bold">COUPON CODE: {generateRandomCoupon()}</p>
                <p className="text-[#666666]">Save for your next commit!</p>
              </div>

              <div className="mb-6 space-y-1">
                <p>CARD #: **** **** **** 2024</p>
                <p>AUTH CODE: {generateRandomAuth()}</p>
                <p>CARDHOLDER: {(userData.name || username).toUpperCase()}</p>
              </div>

              <div className="text-center mb-6 font-bold">
                <p>THANK YOU FOR CODING!</p>
              </div>

              <div className="border-t border-[#eaeaea] pt-4 text-center text-[#666666]">
                <p>github.com/{username}</p>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#666666] hover:bg-[#f5f5f5] shadow-sm">
                <Download className="h-5 w-5" />
                Download
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-[#e5e5e5] rounded-xl text-[#666666] hover:bg-[#f5f5f5] shadow-sm">
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}