import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const CreateTrackingLink = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    originalUrl: "",
    customCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);

  // Generate random short code
  const generateShortCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate URL
      if (!validateUrl(formData.originalUrl)) {
        toast.error("Please enter a valid URL (include http:// or https://)");
        setLoading(false);
        return;
      }

      // Generate or use custom short code
      const shortCode = formData.customCode.trim() || generateShortCode();

      // Check if short code already exists
      const { data: existingLink } = await supabase
        .from("tracking_links")
        .select("short_code")
        .eq("short_code", shortCode)
        .single();

      if (existingLink) {
        toast.error("This short code is already taken. Please choose another one.");
        setLoading(false);
        return;
      }

      // Create tracking link
      const { data, error } = await supabase
        .from("tracking_links")
        .insert([
          {
            user_id: currentUser.id,
            title: formData.title || "Untitled Link",
            original_url: formData.originalUrl,
            short_code: shortCode,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Generate full tracking URL
      const trackingUrl = `${window.location.origin}/t/${shortCode}`;
      setGeneratedLink({
        ...data,
        trackingUrl,
      });

      toast.success("Tracking link created successfully!");

      // Reset form
      setFormData({
        title: "",
        originalUrl: "",
        customCode: "",
      });
    } catch (error) {
      console.error("Error creating tracking link:", error);
      toast.error("Failed to create tracking link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink.trackingUrl);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Create Tracking Link
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Generate a tracking link to monitor clicks and visitor locations
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Link Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., My Campaign Link"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              />
            </div>

            {/* Original URL */}
            <div>
              <label
                htmlFor="originalUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Destination URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="originalUrl"
                name="originalUrl"
                value={formData.originalUrl}
                onChange={handleChange}
                placeholder="https://example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The URL where visitors will be redirected
              </p>
            </div>

            {/* Custom Short Code */}
            <div>
              <label
                htmlFor="customCode"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Custom Short Code (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {window.location.origin}/t/
                </span>
                <input
                  type="text"
                  id="customCode"
                  name="customCode"
                  value={formData.customCode}
                  onChange={handleChange}
                  placeholder="my-link"
                  pattern="[A-Za-z0-9_-]+"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to generate a random code
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Tracking Link"
              )}
            </button>
          </form>

          {/* Generated Link Display */}
          {generatedLink && (
            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
                🎉 Link Created Successfully!
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Tracking Link:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={generatedLink.trackingUrl}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/tracking/${generatedLink.id}`)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Analytics
                  </button>
                  <button
                    onClick={() => navigate("/tracking")}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View All Links
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            How It Works
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">1.</span>
              <span>Create a tracking link with your destination URL</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">2.</span>
              <span>Share the generated tracking link with your audience</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">3.</span>
              <span>
                When someone clicks the link, we capture their location data (country, city,
                region)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">4.</span>
              <span>View detailed analytics and click statistics in your dashboard</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateTrackingLink;
