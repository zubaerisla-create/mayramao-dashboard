// app/dashboard/contact-support/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useGetTicketsQuery, useGetTicketByIdQuery, useReplyToTicketMutation } from "@/lib/store/apiSlice";
import { useAppSelector } from "@/lib/store/hooks";
import toast from 'react-hot-toast';

interface Ticket {
  _id: string
  userId: string
  userEmail: string
  subject: string
  status: 'new' | 'replied' | 'open' | 'closed'
  adminId: string | null
  adminTicketId: string
  reply: string
  ticketId: string
  dateSubmitted: string
  createdAt: string
  updatedAt: string
  closeAt: string | null
  __v: number
}

export default function ContactSupport() {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [replyText, setReplyText] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch all tickets with auto-refresh (poll every 10 seconds)
  const { 
    data: ticketsData, 
    isLoading: ticketsLoading, 
    error: ticketsError,
    refetch: refetchTickets 
  } = useGetTicketsQuery(undefined, {
    pollingInterval: 10000, // Auto-refresh every 10 seconds
    refetchOnFocus: true,    // Refetch when window gains focus
    refetchOnMountOrArgChange: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when internet reconnects
  });

  // Fetch single ticket details with auto-refresh when selected
  const { 
    data: ticketData, 
    isLoading: ticketLoading,
    refetch: refetchTicket 
  } = useGetTicketByIdQuery(selectedTicketId || '', {
    skip: !selectedTicketId,
    pollingInterval: 5000, // Auto-refresh selected ticket every 5 seconds
    refetchOnFocus: true,
  });

  // Reply mutation
  const [replyToTicket, { isLoading: isReplying }] = useReplyToTicketMutation();

  // Update selected ticket when data arrives
  useEffect(() => {
    if (ticketData?.success && ticketData.ticket) {
      setSelectedTicket(ticketData.ticket);
      setReplyText(ticketData.ticket.reply || '');
    }
  }, [ticketData]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const openModal = (ticket: Ticket) => {
    setSelectedTicketId(ticket.ticketId);
  };

  const closeModal = () => {
    setSelectedTicketId(null);
    setSelectedTicket(null);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!selectedTicketId || !replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const response = await replyToTicket({
        ticketId: selectedTicketId,
        reply: replyText.trim()
      }).unwrap();

      if (response.success) {
        toast.success('Reply sent successfully!');
        // Close modal immediately - RTK Query will auto-refresh data
        closeModal();
        
        // Show success message for a moment
        setTimeout(() => {
          toast.success('Data updated automatically!');
        }, 500);
      }
    } catch (err: any) {
      console.error('Reply error:', err);
      const errorMessage = err.data?.message || 'Failed to send reply';
      toast.error(errorMessage);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter tickets
  const filteredTickets = ticketsData?.tickets?.filter((ticket) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      ticket.ticketId?.toLowerCase().includes(searchLower) ||
      ticket.userEmail?.toLowerCase().includes(searchLower) ||
      ticket.subject?.toLowerCase().includes(searchLower) ||
      ticket.status?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Pagination logic
  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Show 5 page numbers at a time
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Middle
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Get counts for status badges
  const ticketCounts = {
    all: ticketsData?.tickets?.length || 0,
    new: ticketsData?.tickets?.filter(t => t.status === 'new').length || 0,
    open: ticketsData?.tickets?.filter(t => t.status === 'open').length || 0,
    replied: ticketsData?.tickets?.filter(t => t.status === 'replied').length || 0,
    closed: ticketsData?.tickets?.filter(t => t.status === 'closed').length || 0,
  };

  if (ticketsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (ticketsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Failed to load tickets</div>
          <button 
            onClick={() => refetchTickets()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-9xl mx-auto">
        {/* Header with auto-refresh indicator */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-[30px] font-bold">Contact & Support</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-refreshing every 10s</span>
          </div>
        </div>
        <p className="text-gray-600 mb-6">Manage user support messages and inquiries</p>

        {/* Alert box - show if there are new tickets */}
        {ticketCounts.new > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-4 rounded-lg mb-6 flex items-center gap-3">
            <span className="text-xl">📧</span>
            <span>
              <strong>You have {ticketCounts.new} new support message{ticketCounts.new > 1 ? 's' : ''} awaiting response.</strong>
            </span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by email, subject, or ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === "all" 
                  ? "bg-emerald-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All ({ticketCounts.all})
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === "new" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              New ({ticketCounts.new})
            </button>
            <button
              onClick={() => setStatusFilter("open")}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === "open" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Open ({ticketCounts.open})
            </button>
            <button
              onClick={() => setStatusFilter("replied")}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === "replied" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Replied ({ticketCounts.replied})
            </button>
            <button
              onClick={() => setStatusFilter("closed")}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === "closed" 
                  ? "bg-gray-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Closed ({ticketCounts.closed})
            </button>
          </div>
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="text-sm text-gray-600 mb-2">
            Found {filteredTickets.length} {filteredTickets.length === 1 ? 'result' : 'results'}
          </p>
        )}

        {/* Showing X to Y of Z results */}
        {filteredTickets.length > 0 && (
          <p className="text-sm text-gray-600 mb-2">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
          </p>
        )}

        {/* Last updated indicator */}
        <p className="text-xs text-gray-400 mb-2">
          Last updated: {new Date().toLocaleTimeString()}
        </p>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTickets.length > 0 ? (
                currentTickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => openModal(ticket)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.ticketId || ticket._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.userEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.status === "new"
                            ? "bg-red-100 text-red-800"
                            : ticket.status === "open"
                            ? "bg-blue-100 text-blue-800"
                            : ticket.status === "replied"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.dateSubmitted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(ticket);
                        }}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery || statusFilter !== "all" 
                      ? `No tickets found matching your filters` 
                      : "No tickets available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {/* Previous button */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Previous
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page as number)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            {/* Next button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Items per page indicator */}
        {totalItems > 0 && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Page {currentPage} of {totalPages}
          </div>
        )}

        {/* Modal - appears when clicking View */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
              {/* Header with auto-refresh indicator for modal */}
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">
                    Support Ticket {selectedTicket.ticketId || selectedTicket._id.slice(-8).toUpperCase()}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>live</span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {ticketLoading && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">User Email</p>
                    <p className="mt-1">{selectedTicket.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          selectedTicket.status === "new"
                            ? "bg-red-100 text-red-800"
                            : selectedTicket.status === "open"
                            ? "bg-blue-100 text-blue-800"
                            : selectedTicket.status === "replied"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Subject</p>
                    <p className="mt-1 font-medium">{selectedTicket.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date Submitted</p>
                    <p className="mt-1">{formatDateTime(selectedTicket.dateSubmitted)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="mt-1">{formatDateTime(selectedTicket.updatedAt)}</p>
                  </div>
                  {selectedTicket.closeAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Closed At</p>
                      <p className="mt-1">{formatDateTime(selectedTicket.closeAt)}</p>
                    </div>
                  )}
                  {selectedTicket.adminId && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Handled By</p>
                      <p className="mt-1">Admin ID: {selectedTicket.adminId}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">User Message</p>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p className="whitespace-pre-wrap">{selectedTicket.subject}</p>
                  </div>
                </div>

                {selectedTicket.reply && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Previous Reply</p>
                    <div className="bg-green-50 p-4 rounded border border-green-200">
                      <p className="whitespace-pre-wrap text-green-800">{selectedTicket.reply}</p>
                      {selectedTicket.adminTicketId && (
                        <p className="text-xs text-gray-500 mt-2">Reply ID: {selectedTicket.adminTicketId}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Reply box - only show if ticket is not closed */}
                {selectedTicket.status !== 'closed' && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Send Reply</p>
                    <textarea
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Type your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={isReplying}
                    />
                  </div>
                )}

                {selectedTicket.status === 'closed' && (
                  <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600">
                    This ticket is closed. No further replies can be sent.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                {selectedTicket.status !== 'closed' && (
                  <button
                    onClick={handleSendReply}
                    disabled={isReplying || !replyText.trim()}
                    className="px-5 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isReplying ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reply</span>
                        <span>➤</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}