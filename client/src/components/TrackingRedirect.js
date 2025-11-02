import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase";

const TrackingRedirect = () => {
  const { shortCode } = useParams();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // 1. Fetch the tracking link from database
        const { data: linkData, error: linkError } = await supabase
          .from("tracking_links")
          .select("id, original_url")
          .eq("short_code", shortCode)
          .single();

        if (linkError || !linkData) {
          setStatus("error");
          setError("Link not found");
          return;
        }

        // 2. Get user's IP and location data
        let locationData = {
          ip_address: "Unknown",
          country: "Unknown",
          city: "Unknown",
          region: "Unknown",
          latitude: null,
          longitude: null,
        };

        try {
          const ipResponse = await fetch("https://ipapi.co/json/");
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            locationData = {
              ip_address: ipData.ip || "Unknown",
              country: ipData.country_name || "Unknown",
              city: ipData.city || "Unknown",
              region: ipData.region || "Unknown",
              latitude: ipData.latitude || null,
              longitude: ipData.longitude || null,
            };
          }
        } catch (ipError) {
          console.error("Failed to fetch IP data:", ipError);
          // Continue with unknown location data
        }

        // 3. Record the click in database
        const clickData = {
          link_id: linkData.id,
          ip_address: locationData.ip_address,
          country: locationData.country,
          city: locationData.city,
          region: locationData.region,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          user_agent: navigator.userAgent,
          clicked_at: new Date().toISOString(),
        };

        // Insert click data (don't wait for response)
        supabase.from("link_clicks").insert([clickData]).then(({ error: clickError }) => {
          if (clickError) {
            console.error("Failed to record click:", clickError);
          }
        });

        // 4. Redirect to original URL
        setStatus("redirecting");
        window.location.href = linkData.original_url;
      } catch (err) {
        console.error("Redirect error:", err);
        setStatus("error");
        setError("An error occurred while processing the link");
      }
    };

    handleRedirect();
  }, [shortCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Loading...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we process your request
            </p>
          </div>
        )}

        {status === "redirecting" && (
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <svg
                className="w-16 h-16 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Redirecting...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You will be redirected shortly
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <a
              href="/"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingRedirect;
