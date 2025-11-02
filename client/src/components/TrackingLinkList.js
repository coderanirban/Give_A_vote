import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const TrackingLinkList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchLinks();
  }, [currentUser]);

  const fetchLinks = async () => {
    try {
      setLoading(true);

      // Fetch user's tracking links
      const { data: linksData, error: linksError } = await supabase
        .from("tracking_links")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (linksError) throw linksError;

      setLinks(linksData || []);

      // Fetch click stats for each link
      if (linksData && linksData.length > 0) {
        const statsPromises = linksData.map(async (link) => {
          const { data: clicksData, error: clicksError } = await supabase
            .from("link_clicks")
            .select("id, ip_address, clicked_at")
            .eq("link_id", link.id);

          if (clicksError) {
            console.error("Error fetching clicks:", clicksError);
            return { linkId: link.id, totalClicks: 0, uniqueIps: 0, lastClick: null };
          }

          const uniqueIps = new Set(clicksData.map((click) => click.ip_address)).size;
          const lastClick = clicksData.length > 0 ? clicksData[0].clicked_at : null;

          return {
            linkId: link.id,
            totalClicks: clicksData.length,
            uniqueIps,
            lastClick,
          };
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        statsResults.forEach((stat) => {
          statsMap[stat.linkId] = stat;
        });
        setStats(statsMap);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
      toast.error("Failed to load tracking links");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (shortCode) => {
    const trackingUrl = `${window.location.origin}/t/${shortCode}`;
    navigator.clipboard.writeText(trackingUrl);
    toast.success("Link copied to clipboard!");
  };

  const deleteLink = async (linkId) => {
    if (!window.confirm("Are you sure you want to delete this tracking link?")) {
      return;
    }

    try {
      const { error } = await supabase.from("tracking_links").delete().eq("id", linkId);

      if (error) throw error;

      toast.success("Link deleted successfully");
      fetchLinks(); // Refresh the list
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Tracking Links Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage and monitor your tracking links
              </p>
            </div>
            <button
              onClick={() => navigate("/tracking/create")}
              className="mt-4 md:mt-0 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              + Create New Link
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold">{links.length}</div>
              <div className="text-blue-100 mt-1">Total Links</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold">
                {Object.values(stats).reduce((sum, stat) => sum + stat.totalClicks, 0)}
              </div>
              <div className="text-green-100 mt-1">Total Clicks</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold">
                {Object.values(stats).reduce((sum, stat) => sum + stat.uniqueIps, 0)}
              </div>
              <div className="text-purple-100 mt-1">Unique Visitors</div>
            </div>
          </div>
        </div>

        {/* Links List */}
        {links.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              No Tracking Links Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first tracking link to start monitoring clicks and locations
            </p>
            <button
              onClick={() => navigate("/tracking/create")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Your First Link
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => {
              const linkStats = stats[link.id] || {
                totalClicks: 0,
                uniqueIps: 0,
                lastClick: null,
              };
              const trackingUrl = `${window.location.origin}/t/${link.short_code}`;

              return (
                <div
                  key={link.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {link.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-2">Tracking URL:</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {trackingUrl}
                          </code>
                          <button
                            onClick={() => copyToClipboard(link.short_code)}
                            className="ml-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-2">Destination:</span>
                          <a
                            href={link.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 truncate"
                          >
                            {link.original_url}
                          </a>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Created: {formatDate(link.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                      {/* Stats */}
                      <div className="flex space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {linkStats.totalClicks}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {linkStats.uniqueIps}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Unique</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/tracking/${link.id}`)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          View Analytics
                        </button>
                        <button
                          onClick={() => deleteLink(link.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingLinkList;
