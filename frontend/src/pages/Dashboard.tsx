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

  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 5;

  const [darkMode, setDarkMode] = useState(false);

  const [loading, setLoading] = useState(true);

  const [leads, setLeads] = useState<Lead[]>([]);

  const userRole = localStorage.getItem("role");

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Leads
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
      console.log("Fetch Leads Error:", error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Add or Update Lead
  const addLead = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await API.put(`/leads/${editingId}`, {
          name,
          email,
          status,
          source,
        });

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
      console.log("Add Lead Error:", error);
    }
  };

  // Delete Lead
  const deleteLead = async (id: string) => {
    try {
      await API.delete(`/leads/${id}`);

      fetchLeads();
    } catch (error) {
      console.log("Delete Error:", error);
    }
  };

  // Edit Lead
  const editLead = (lead: Lead) => {
    setName(lead.name);
    setEmail(lead.email);
    setStatus(lead.status);
    setSource(lead.source);
    setEditingId(lead._id);
  };

  // Filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      lead.email
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());

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
  });

  // Pagination
  const indexOfLastLead =
    currentPage * leadsPerPage;

  const indexOfFirstLead =
    indexOfLastLead - leadsPerPage;

  const currentLeads =
    filteredLeads.slice(
      indexOfFirstLead,
      indexOfLastLead
    );

  const totalPages = Math.ceil(
    filteredLeads.length / leadsPerPage
  );

  return (
    <div
      className={
        darkMode
          ? "bg-black text-white min-h-screen p-10"
          : "bg-gray-100 min-h-screen p-10"
      }
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Smart Leads Dashboard 🚀
        </h1>

        <div className="space-x-3">
          <button
            onClick={() =>
              setDarkMode(!darkMode)
            }
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            {darkMode
              ? "Light Mode"
              : "Dark Mode"}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");

              window.location.href = "/login";
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white text-black p-6 rounded shadow">
          <h2 className="text-xl font-bold">
            Total Leads
          </h2>

          <p className="text-3xl mt-2">
            {leads.length}
          </p>
        </div>

        <div className="bg-white text-black p-6 rounded shadow">
          <h2 className="text-xl font-bold">
            Active Leads
          </h2>

          <p className="text-3xl mt-2">
            {
              leads.filter(
                (lead) =>
                  lead.status !== "Closed"
              ).length
            }
          </p>
        </div>

        <div className="bg-white text-black p-6 rounded shadow">
          <h2 className="text-xl font-bold">
            Closed Leads
          </h2>

          <p className="text-3xl mt-2">
            {
              leads.filter(
                (lead) =>
                  lead.status === "Closed"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={addLead}
        className="bg-white text-black p-6 rounded shadow mb-8 space-y-4"
      >
        <h2 className="text-2xl font-bold">
          {editingId
            ? "Edit Lead"
            : "Add Lead"}
        </h2>

        <input
          type="text"
          placeholder="Lead Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="border p-3 w-full rounded"
          required
        />

        <input
          type="email"
          placeholder="Lead Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="border p-3 w-full rounded"
          required
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="border p-3 w-full rounded"
        >
          <option value="New">New</option>

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
          className="border p-3 w-full rounded"
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
        </select>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-3 rounded"
        >
          {editingId
            ? "Update Lead"
            : "Add Lead"}
        </button>
      </form>

      {/* Leads List */}
      <div className="bg-white text-black p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Leads List
          </h2>

          <CSVLink
            data={filteredLeads}
            filename={"leads.csv"}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Export CSV
          </CSVLink>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border p-2 rounded"
          />

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
            className="border p-2 rounded"
          >
            <option value="">
              All Status
            </option>

            <option value="New">New</option>

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
              setFilterSource(e.target.value)
            }
            className="border p-2 rounded"
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
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <p className="text-center text-lg">
            Loading leads...
          </p>
        ) : currentLeads.length === 0 ? (
          <p className="text-center text-lg">
            No leads found
          </p>
        ) : (
          <div className="space-y-4">
            {currentLeads.map((lead) => (
              <div
                key={lead._id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <h2 className="font-bold text-lg">
                    {lead.name}
                  </h2>

                  <p>{lead.email}</p>

                  <p>
                    Status: {lead.status}
                  </p>

                  <p>
                    Source: {lead.source}
                  </p>
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() =>
                      editLead(lead)
                    }
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>

                  {userRole === "admin" && (
                    <button
                      onClick={() =>
                        deleteLead(lead._id)
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          {Array.from(
            { length: totalPages },
            (_, i) => (
              <button
                key={i}
                onClick={() =>
                  setCurrentPage(i + 1)
                }
                className={`px-4 py-2 rounded text-white ${
                  currentPage === i + 1
                    ? "bg-blue-700"
                    : "bg-blue-500"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;