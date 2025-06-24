import { useProfileSummary } from '~/hooks/useProfileSummary';
import { ProfileAvatar } from '~/modules/profile/components/profile-avatar';
import {
  ProfileSection,
  TagGrid,
} from '~/modules/profile/components/profile-section';
import { createMockProfileSummary } from '~/modules/profile/mock-data';
import type { ProfileSummaryData } from '~/infra/profile/types';
import { Link, useLoaderData } from 'react-router';
import type { Route } from './+types/profile-summary';
import { getSessionUser } from '~/infra/session';

export function loader() {
  return {
    username: getSessionUser().nickname,
    age: getSessionUser().age,
    location: getSessionUser().location,
  };
}

export default function ProfileSummaryRoute({
  loaderData,
}: Route.ComponentProps) {
  const profile = useProfileSummary();
  const { username } = loaderData;

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Use actual profile data or fall back to mock data
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8 flex flex-row items-center justify-center gap-4">
          {/* Circular Avatar with Glow Effect */}
          <div className="relative w-24 h-24 mb-6">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl animate-pulse"></div>

            {/* Main circle container */}
            <div className="relative w-full h-full rounded-full bg-gray-900 border border-gray-700 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 120 120">
                {/* Background gradient */}
                <defs>
                  <radialGradient
                    id="backgroundGradient"
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1f2937" />
                  </radialGradient>

                  <linearGradient
                    id="ringGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="58"
                  fill="url(#backgroundGradient)"
                />

                {/* Concentric circles with pulsing animation */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="1"
                  opacity="0.6"
                  className="animate-pulse"
                  style={{ animationDelay: '0s', animationDuration: '3s' }}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="35"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="1"
                  opacity="0.4"
                  className="animate-pulse"
                  style={{ animationDelay: '1s', animationDuration: '3s' }}
                />
                <circle
                  cx="60"
                  cy="60"
                  r="25"
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="1"
                  opacity="0.3"
                  className="animate-pulse"
                  style={{ animationDelay: '2s', animationDuration: '3s' }}
                />

                {/* Center dot */}
                <circle
                  cx="60"
                  cy="60"
                  r="4"
                  fill="#8b5cf6"
                  className="animate-pulse"
                  style={{ animationDuration: '2s' }}
                />

                {/* Floating dots around the circles */}
                <circle
                  cx="85"
                  cy="45"
                  r="2"
                  fill="#ec4899"
                  opacity="0.7"
                  className="animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
                <circle
                  cx="35"
                  cy="75"
                  r="1.5"
                  fill="#8b5cf6"
                  opacity="0.5"
                  className="animate-pulse"
                  style={{ animationDelay: '1.5s' }}
                />
                <circle
                  cx="75"
                  cy="85"
                  r="1"
                  fill="#f59e0b"
                  opacity="0.6"
                  className="animate-pulse"
                  style={{ animationDelay: '2.5s' }}
                />
                <circle
                  cx="25"
                  cy="40"
                  r="1.5"
                  fill="#06b6d4"
                  opacity="0.4"
                  className="animate-pulse"
                  style={{ animationDelay: '3s' }}
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-white mb-2">{username}</h1>
            <p className="text-gray-400 text-lg">
              {profile.age} • {profile.location}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <ProfileSection title="Core Values">
          <TagGrid tags={profile.core_values} variant="primary" />
        </ProfileSection>

        {/* Interests */}
        <ProfileSection title="Interests">
          <TagGrid tags={profile.top_interests} variant="secondary" />
        </ProfileSection>

        {/* Communication Style */}
        <ProfileSection title="Communication Style">
          <p className="text-gray-300 text-base leading-relaxed">
            {profile.personality_style}
          </p>
        </ProfileSection>

        {/* Voice Style */}
        <ProfileSection title="Voice Style">
          <p className="text-gray-300 text-base leading-relaxed">
            {profile.voice_style}
          </p>
        </ProfileSection>

        {/* Emotional Signature */}
        <ProfileSection title="Emotional Signature">
          <p className="text-gray-300 text-base leading-relaxed">
            {profile.emotional_signature}
          </p>
        </ProfileSection>

        {/* Quotes */}
        {profile.quotes && profile.quotes.length > 0 && (
          <ProfileSection title="Quotes">
            <div className="space-y-4">
              {profile.quotes.map((quote, index) => (
                <blockquote
                  key={index}
                  className="border-l-4 border-purple-500 pl-4 italic text-gray-300"
                >
                  "{quote}"
                </blockquote>
              ))}
            </div>
          </ProfileSection>
        )}

        {/* Summary */}
        <div className="mb-12">
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
              Summary
            </h3>
            <p className="text-gray-300 text-base leading-relaxed">
              {profile.summary}
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-8 h-8 mx-auto text-purple-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2A5.37 5.37 0 0 0 5.4 6.62C2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01-.01L13.52 12l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12a5.37 5.37 0 0 0 3.82 1.58c2.98 0 5.4-2.41 5.4-5.38s-2.42-5.38-5.4-5.38z" />
            </svg>
          </div>
          <p className="text-gray-400 text-base mb-6">
            Potential connections waiting
          </p>

          {/* Discovery Button */}
          <Link
            to="/discovery"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Start Discovery
          </Link>
        </div>
      </div>
    </div>
  );
}
