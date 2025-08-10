import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdDownload } from "react-icons/io";
import { MdMoreVert } from "react-icons/md";
import { FaRegCommentDots } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { useSelector } from "react-redux";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Backend API
  withCredentials: true, // Ensure credentials (cookies) are sent with requests
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Use the correct token
  },
});

// Custom Autocomplete Dropdown Component
const AutocompleteDropdown = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update filtered options when input changes
  useEffect(() => {
    if (inputValue === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleSelectOption = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          className="border w-full p-2 pr-10 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        {inputValue && (
          <button
            className="absolute right-10 top-2 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <button
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleSelectOption(option)}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
};

const BrowseNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const suggestionRef = useRef(null);
  const [note, setNote] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  // const handleClick = () => {
  //   if (currentUser) {
  //     if (note) {
  //       downloadFile(note.fileUrl, note.title);
  //     } else {
  //       console.error("No note selected");
  //     }
  //   } else {
  //     navigate("/sign-in");
  //   }
  // };

  // Added filter states
  const [filters, setFilters] = useState({
    subject: "",
    course: "",
    semester: "",
    college: "",
  });

  // Fetch unique filter options
  const [filterOptions, setFilterOptions] = useState({
    subjects: [],
    courses: [],
    semesters: [],
    colleges: [],
  });

  // Handle clicks outside of suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch Notes from the backend with filters
  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/notes", {
        params: {
          search: search || "",
          subject: filters.subject,
          course: filters.course,
          semester: filters.semester,
          college: filters.college,
        },
      });

      setNotes(response.data.notes); // Update state with fetched notes

      // Extract unique filter options from data if not already populated
      if (filterOptions.subjects.length === 0) {
        extractFilterOptions(response.data.notes);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate search suggestions
  const generateSearchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      // You could have a separate API endpoint for suggestions
      // or just filter from existing data
      const response = await axios.get(
        "http://localhost:3000/api/search-suggestions",
        {
          params: { query },
        }
      );

      // If you don't have a suggestions endpoint, you could use this mockup:
      // Simulate API response with notes titles and subjects
      const allItems = [
        ...notes.map((note) => note.title),
        ...filterOptions.subjects,
        ...filterOptions.courses,
        ...filterOptions.colleges,
      ];

      const filteredSuggestions = allItems
        .filter(
          (item) => item && item.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions

      setSearchSuggestions(filteredSuggestions);
    } catch (error) {
      console.error("Error getting search suggestions:", error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    generateSearchSuggestions(query);
    setShowSuggestions(true);
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    setSearch(suggestion);
    setShowSuggestions(false);
  };

  // Extract unique filter options from notes
  const extractFilterOptions = (notesData) => {
    const subjects = [
      ...new Set(notesData.map((note) => note.subjectName).filter(Boolean)),
    ];
    const courses = [
      ...new Set(notesData.map((note) => note.courseName).filter(Boolean)),
    ];
    const semesters = [
      ...new Set(notesData.map((note) => note.semester).filter(Boolean)),
    ];
    const colleges = [
      ...new Set(notesData.map((note) => note.collegeName).filter(Boolean)),
    ];

    setFilterOptions({
      subjects,
      courses,
      semesters,
      colleges,
    });
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      subject: "",
      course: "",
      semester: "",
      college: "",
    });
    setSearch("");
    setSearchSuggestions([]);
  };

  // Like Note
  const likeNote = async (id) => {
    try {
      await api.put(`/notes/${id}/like`);
      fetchNotes(); // Refresh the notes list after like/unlike action
    } catch (err) {
      console.error("Error liking note:", err);
    }
  };

  const downloadFile = async (url, filename) => {
    if (!url) {
      console.error("File URL is invalid");
      return;
    }

    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || "download.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  // Open Comments Section for a Note
  const openComments = (note) => {
    setSelectedNote(note);
    setCommentText(""); // Clear the previous comment
  };

  // Add Comment
  const addComment = async () => {
    if (!commentText.trim()) return; // Do nothing if comment is empty
    try {
      await api.post(`/notes/${selectedNote._id}/comment`, {
        text: commentText,
      });
      const updated = await api.get(`/notes?search=${selectedNote._id}`);
      setSelectedNote(updated.data.notes[0]);
      setCommentText("");
      fetchNotes(); // Refresh the list to sync comments count
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [
    search,
    filters.subject,
    filters.course,
    filters.semester,
    filters.college,
  ]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 p-4 text-white">
          <h1 className="text-3xl font-bold text-center">
            Explore Shared Notes
          </h1>
        </div>

        <div className="p-6">
          {/* 🔍 Search with Suggestions */}
          <div className="relative mb-6" ref={suggestionRef}>
            <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-100 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="p-3 w-full focus:outline-none"
                placeholder="Search for notes, subjects, or courses..."
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-10">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/*  Filters with Autocomplete */}
          <div className="mb-6">
            {/* <h2 className="font-medium text-lg mb-2 text-gray-700">
              Filter Notes
            </h2> */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Subject Filter */}
              <AutocompleteDropdown
                label="Subject"
                value={filters.subject}
                onChange={(value) => handleFilterChange("subject", value)}
                options={filterOptions.subjects}
                placeholder="eg. Operating Systems"
              />

              {/* Course Filter */}
              <AutocompleteDropdown
                label="Course"
                value={filters.course}
                onChange={(value) => handleFilterChange("course", value)}
                options={filterOptions.courses}
                placeholder="eg. B.Tech CSE"
              />

              {/* Semester Filter */}
              <AutocompleteDropdown
                label="Semester"
                value={filters.semester}
                onChange={(value) => handleFilterChange("semester", value)}
                options={filterOptions.semesters}
                placeholder="eg. 3"
              />

              {/* College Filter */}
              <AutocompleteDropdown
                label="College"
                value={filters.college}
                onChange={(value) => handleFilterChange("college", value)}
                options={filterOptions.colleges}
                placeholder="eg. MANIT Bhopal"
              />
            </div>

            {/* Reset Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="cursor-pointer bg-gray-200 text-gray-800 px-4 py-1 rounded-md hover:bg-gray-300 transition duration-150 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Notes List */}
          {!selectedNote && !isLoading ? (
            notes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
                {notes.map((note) => (
                  <div
                    key={note._id}
                    className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-5">
                      <h2 className="font-bold text-xl mb-2 text-gray-800">
                        {note.title}
                      </h2>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {note.description}
                      </p>

                      <div className="space-y-1 text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <span className="mr-1"></span>
                          <span className="font-medium">Subject:</span>
                          <span className="ml-1">
                            {note.subjectName || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <span className="mr-1"></span>
                          <span className="font-medium">Course:</span>
                          <span className="ml-1">
                            {note.courseName || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <span className="mr-1"></span>
                          <span className="font-medium">College:</span>
                          <span className="ml-1">
                            {note.collegeName || "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center">
                          <span className="mr-1"></span>
                          <span className="font-medium">Semester:</span>
                          <span className="ml-1">{note.semester || "N/A"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t">
                        <button
                          onClick={() => likeNote(note._id)}
                          className="cursor-pointer flex items-center text-red-600 hover:text-red-700 transition-colors"
                        >
                          <span>❤</span>
                          <span className="ml-1">
                            {note.likes?.length || 0}
                          </span>
                        </button>

                        <button
                          onClick={() => openComments(note)}
                          className="cursor-pointer flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <span>
                            <FaRegCommentDots />
                          </span>
                          <span className="ml-1">
                            {note.comments?.length || 0}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            if (currentUser) {
                              if (note) {
                                downloadFile(note.fileUrl, note.title);
                              } else {
                                console.error("No note selected");
                              }
                            } else {
                              navigate("/sign-in");
                            }
                          }}
                          className=" cursor-pointer flex items-center text-green-600 hover:text-green-700 transition-colors"
                        >
                          <span>
                            <IoMdDownload />
                          </span>
                          <span className="ml-1">Download</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate(`/notes/${note._id}`);
                          }}
                          className="cursor-pointer flex items-center text-green-600 hover:text-green-700 transition-colors"
                        >
                          <span>
                            <MdMoreVert />
                          </span>
                          <span className="ml-1">Detail</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M9 16h6M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                  />
                </svg>
                <p className="text-lg text-gray-600 font-medium">
                  No notes found matching your filters
                </p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search criteria or clear filters
                </p>
              </div>
            )
          ) : null}

          {/* Comment Section */}
          {selectedNote && (
            <div className="bg-white border rounded-lg overflow-hidden shadow-md">
              <div className="p-6">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="cursor-pointer mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Notes
                </button>

                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  {selectedNote.title}
                </h2>
                <p className="mb-4 text-gray-700">{selectedNote.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 p-4 rounded-md">
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">
                        Subject:
                      </span>
                      <span className="ml-1">
                        {selectedNote.subjectName || "N/A"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">
                        Course:
                      </span>
                      <span className="ml-1">
                        {selectedNote.courseName || "N/A"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">
                        College:
                      </span>
                      <span className="ml-1">
                        {selectedNote.collegeName || "N/A"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-700">
                        Semester:
                      </span>
                      <span className="ml-1">
                        {selectedNote.semester || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    Add a Comment
                  </h3>
                  <textarea
                    className="border p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your thoughts on these notes..."
                    rows="3"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    onClick={addComment}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Submit Comment
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    Comments ({selectedNote.comments.length})
                  </h3>

                  {selectedNote.comments.length === 0 && (
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <p className="text-gray-500">
                        No comments yet. Be the first to comment!
                      </p>
                    </div>
                  )}

                  {selectedNote.comments.map((c, idx) => (
                    <div key={idx} className="border-b py-3 last:border-b-0">
                      {console.log(c)}
                      <h2 className="text-green-600">
                        <span>
                          <CgProfile />
                        </span>
                        User_{c._id.slice(0, 4)}
                      </h2>
                      <p className="text-gray-800 mt-1">{c.text}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{new Date(c.commentedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseNotes;
