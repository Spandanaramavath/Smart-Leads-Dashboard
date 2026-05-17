import { useEffect, useState } from "react";
import API from "../services/api";
import { CSVLink } from "react-csv";

interface Lead {
  _id: string;
  name: string;
  email: string;
  status: string;
  source: string;
}

const Dashboard = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("New");
  const [source, setSource] = useState("Website");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("");

  const [filterSource, setFilterSource] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  // 10 LEADS PER PAGE
  const leadsPerPage = 10;

  const [darkMode, setDarkMode] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [leads, setLeads] =
    useState<Lead[]>([]);

  // SEARCH DELAY
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // FETCH LEADS
  const fetchLeads = async () => {
    try {
      setLoading(true);

      const res = await API.get("/leads");

      if (Array.isArray(res.data)) {
        setLeads(res.data);
      } else if (res.data.leads) {
        setLeads(res.data.leads);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.log(
        "Fetch Leads Error:",
        error
      );

      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ADD / UPDATE LEAD
  const addLead = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(
          `/leads/${editingId}`,
          {
            name,
            email,
            status,
            source,
          }
        );

        setEditingId(null);
      } else {
        await API.post("/leads", {
          name,
          email,
          status,
          source,
        });
      }

      setName("");
      setEmail("");
      setStatus("New");
      setSource("Website");

      fetchLeads();
    } catch (error) {
      console.log(
        "Add Lead Error:",
        error
      );
    }
  };

  // DELETE LEAD
  const deleteLead = async (
    id: string
  ) => {
    try {
      await API.delete(`/leads/${id}`);

      fetchLeads();
    } catch (error) {
      console.log(
        "Delete Error:",
        error
      );
    }
  };

  // EDIT LEAD
  const editLead = (lead: Lead) => {
    setName(lead.name);
    setEmail(lead.email);
    setStatus(lead.status);
    setSource(lead.source);
    setEditingId(lead._id);
  };

  // FILTERS
  const filteredLeads = leads.filter(
    (lead) => {
      const matchesSearch =
        lead.name
          .toLowerCase()
          .includes(
            debouncedSearch.toLowerCase()
          ) ||
        lead.email
          .toLowerCase()
          .includes(
            debouncedSearch.toLowerCase()
          );

      const matchesStatus =
        filterStatus === "" ||
        lead.status === filterStatus;

      const matchesSource =
        filterSource === "" ||
        lead.source === filterSource;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSource
      );
    }
  );

  // PAGINATION
  const indexOfLastLead =
    currentPage * leadsPerPage;

  const indexOfFirstLead =
    indexOfLastLead - leadsPerPage;

  const currentLeads =
    filteredLeads.slice(
      indexOfFirstLead,
      indexOfLastLead
    );

  return (
    <div
      className={
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white min-h-screen p-10"
          : "bg-gradient-to-br from-cyan-100 via-purple-100 to-pink-100 min-h-screen p-10"
      }
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-extrabold text-purple-700">
          Smart Leads Dashboard 
        </h1>

        <div className="space-x-3">
          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-lg"
          >
            {darkMode
              ? "Light Mode"
              : "Dark Mode"}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem(
                "token"
              );

              localStorage.removeItem(
                "role"
              );

              window.location.href =
                "/login";
            }}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-3 rounded-xl shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold">
            Total Leads
          </h2>

          <p className="text-5xl mt-4">
            {leads.length}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold">
            Active Leads
          </h2>

          <p className="text-5xl mt-4">
            {
              leads.filter(
                (lead) =>
                  lead.status !==
                  "Closed"
              ).length
            }
          </p>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold">
            Closed Leads
          </h2>

          <p className="text-5xl mt-4">
            {
              leads.filter(
                (lead) =>
                  lead.status ===
                  "Closed"
              ).length
            }
          </p>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={addLead}
        className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl mb-10 space-y-5"
      >
        <h2 className="text-3xl font-bold text-purple-700">
          {editingId
            ? "Edit Lead"
            : "Add Lead"}
        </h2>

        <div className="flex flex-wrap gap-5">
          <input
            type="text"
            placeholder="Lead Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="border-2 border-purple-300 p-4 w-80 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
            required
          />

          <input
            type="email"
            placeholder="Lead Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="border-2 border-purple-300 p-4 w-80 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
            required
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="border-2 border-purple-300 p-4 w-80 rounded-xl"
          >
            <option value="New">
              New
            </option>

            <option value="Contacted">
              Contacted
            </option>

            <option value="Qualified">
              Qualified
            </option>

            <option value="Closed">
              Closed
            </option>
          </select>

          <select
            value={source}
            onChange={(e) =>
              setSource(e.target.value)
            }
            className="border-2 border-purple-300 p-4 w-80 rounded-xl"
          >
            <option value="Website">
              Website
            </option>

            <option value="Instagram">
              Instagram
            </option>

            <option value="LinkedIn">
              LinkedIn
            </option>

            <option value="Facebook">
              Facebook
            </option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-xl text-lg font-semibold"
        >
          {editingId
            ? "Update Lead"
            : "Add Lead"}
        </button>
      </form>

      {/* LEADS LIST */}
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-700">
            Leads List
          </h2>

          <CSVLink
            data={filteredLeads}
            filename={"leads.csv"}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-3 rounded-xl shadow-lg"
          >
            Export CSV
          </CSVLink>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="flex flex-wrap gap-5 mb-8">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border-2 border-cyan-300 p-3 w-80 rounded-xl"
          />

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value
              )
            }
            className="border-2 border-cyan-300 p-3 w-80 rounded-xl"
          >
            <option value="">
              All Status
            </option>

            <option value="New">
              New
            </option>

            <option value="Contacted">
              Contacted
            </option>

            <option value="Qualified">
              Qualified
            </option>

            <option value="Closed">
              Closed
            </option>
          </select>

          <select
            value={filterSource}
            onChange={(e) =>
              setFilterSource(
                e.target.value
              )
            }
            className="border-2 border-cyan-300 p-3 w-80 rounded-xl"
          >
            <option value="">
              All Sources
            </option>

            <option value="Website">
              Website
            </option>

            <option value="Instagram">
              Instagram
            </option>

            <option value="LinkedIn">
              LinkedIn
            </option>

            <option value="Facebook">
              Facebook
            </option>
          </select>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-center text-2xl text-purple-600">
            Loading leads...
          </p>
        ) : currentLeads.length ===
          0 ? (
          <p className="text-center text-2xl text-red-500">
            No leads found
          </p>
        ) : (
          <div className="space-y-6">
            {currentLeads.map(
              (lead) => (
                <div
                  key={lead._id}
                  className="bg-gradient-to-r from-white to-cyan-50 border border-cyan-200 p-6 rounded-3xl flex justify-between items-center shadow-xl"
                >
                  <div>
                    <h2 className="font-bold text-3xl text-indigo-700">
                      {lead.name}
                    </h2>

                    <p className="text-gray-700 text-xl mt-1">
                      {lead.email}
                    </p>

                    <p className="text-purple-600 font-semibold text-xl mt-2">
                      Status:
                      {" "}
                      {lead.status}
                    </p>

                    <p className="text-pink-600 font-semibold text-xl">
                      Source:
                      {" "}
                      {lead.source}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        editLead(
                          lead
                        )
                      }
                      className="bg-amber-400 hover:bg-amber-500 text-white px-7 py-3 rounded-2xl shadow-lg font-bold text-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteLead(
                          lead._id
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-7 py-3 rounded-2xl shadow-lg font-bold text-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center items-center mt-10 gap-4 flex-wrap">
          {Array.from(
            {
              length: Math.ceil(
                filteredLeads.length /
                  leadsPerPage
              ),
            },
            (_, index) => (
              <button
                key={index}
                onClick={() =>
                  setCurrentPage(
                    index + 1
                  )
                }
                className={`px-5 py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-300 ${
                  currentPage ===
                  index + 1
                    ? "bg-purple-700 scale-110"
                    : "bg-cyan-500 hover:bg-cyan-600"
                }`}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;