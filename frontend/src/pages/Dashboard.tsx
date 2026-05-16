import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import API from "../services/api";

const Dashboard = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [status, setStatus] =
    useState("New");

  const [source, setSource] =
    useState("Website");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("");

  const [leads, setLeads] =
    useState<any[]>([]);

  const fetchLeads = async () => {
    try {

      const res = await API.get("/leads");

      setLeads(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }

    fetchLeads();

  }, []);

  const addLead = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!name || !email) {
      alert("All fields required");
      return;
    }

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
      console.log(error);
    }
  };

  const deleteLead = async (
    id: string
  ) => {

    try {

      await API.delete(`/leads/${id}`);

      fetchLeads();

    } catch (error) {
      console.log(error);
    }
  };

  const editLead = (lead: any) => {

    setName(lead.name);

    setEmail(lead.email);

    setStatus(lead.status);

    setSource(lead.source);

    setEditingId(lead._id);
  };

  const filteredLeads = leads.filter(
    (lead) => {

      const matchesSearch =
        lead.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        lead.email
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "" ||
        lead.status === filterStatus;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Smart Leads Dashboard 🚀
        </h1>

        <div className="space-x-2">

          <CSVLink
            data={leads}
            filename="leads.csv"
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Export CSV
          </CSVLink>

          <button
            onClick={() => {
              localStorage.removeItem("token");

              window.location.href = "/login";
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>

        </div>

      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">

        <div className="bg-white p-6 rounded shadow">

          <h2 className="text-xl font-bold">
            Total Leads
          </h2>

          <p className="text-3xl mt-2">
            {leads.length}
          </p>

        </div>

        <div className="bg-white p-6 rounded shadow">

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

        <div className="bg-white p-6 rounded shadow">

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

      <form
        onSubmit={addLead}
        className="bg-white p-6 rounded shadow mb-8 space-y-4"
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
        />

        <input
          type="email"
          placeholder="Lead Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="border p-3 w-full rounded"
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="border p-3 w-full rounded"
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
          className="border p-3 w-full rounded"
        >

          <option value="Website">
            Website
          </option>

          <option value="Instagram">
            Instagram
          </option>

          <option value="Referral">
            Referral
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

      <div className="bg-white p-6 rounded shadow">

        <div className="flex justify-between items-center mb-4">

          <h2 className="text-2xl font-bold">
            Leads List
          </h2>

          <div className="flex gap-2">

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

          </div>

        </div>

        {filteredLeads.length === 0 && (
          <p>No Leads Found</p>
        )}

        <div className="space-y-4">

          {filteredLeads.map((lead) => (

            <div
              key={lead._id}
              className="border p-4 rounded flex justify-between items-center"
            >

              <div>

                <h2 className="font-bold text-lg">
                  {lead.name}
                </h2>

                <p>{lead.email}</p>

                <p className="text-sm text-gray-500">
                  Status: {lead.status}
                </p>

                <p className="text-sm text-gray-500">
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

                <button
                  onClick={() =>
                    deleteLead(lead._id)
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;