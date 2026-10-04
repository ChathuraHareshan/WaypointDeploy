import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import { api } from "../../api";
const Ctx = createContext(null);
export const useDispatcher = () => useContext(Ctx);
export function DispatcherProvider({ children }) {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openVehicleModal, setOpenVehicleModal] = useState(null);
  const [deferringOrder, setDeferringOrder] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const activeNavTab = location.pathname.split("/")[2] || "allocation";
  const setActiveNavTab = (tab) => navigate("/dispatcher/" + tab);
  const [brandFilter, setBrandFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverTarget, setDragOverTarget] = useState("");
  const [depot, setDepot] = useState("Peliyagoda");
  const loadData = useCallback(() => {
    api
      .board(depot)
      .then(setBoard)
      .catch((e) => setError(e.message));
  }, [depot]);
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);
  const executeAction = (promise, successText = "") => {
    return promise
      .then((res) => {
        setError("");
        if (successText || res?.message) {
          setSuccessMsg(successText || res.message);
          setTimeout(() => setSuccessMsg(""), 4000);
        }
        return loadData();
      })
      .catch((err) => {
        setError("⚠ " + err.message);
        setTimeout(() => setError(""), 6000);
      });
  };
  const handleDrop = (e, vehicleId, trip) => {
    e.preventDefault();
    setDragOverTarget("");
    const orderRef = e.dataTransfer.getData("ref");
    if (orderRef) {
      executeAction(api.assign(orderRef, vehicleId, trip), `Order ${orderRef} assigned to ${vehicleId} (Trip ${trip})`);
    }
  };
  const handleUnassign = (order) => {
    executeAction(api.unassign(order.orderRef), `Order ${order.orderRef} returned to unallocated queue.`);
  };
  const handleAutoAllocate = () => {
    executeAction(api.autoAllocate(depot)).then(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    });
  };
  const handleReset = () => {
    if (window.confirm("Reset all allocations back to unallocated queue for this depot?")) {
      executeAction(api.resetAllocations(depot), "All allocations reset to unallocated queue.");
    }
  };
  const handleConfirmDeferral = (orderRef, reason, notes, rescheduleDate) => {
    return executeAction(
      api.defer(orderRef, reason, notes, rescheduleDate),
      `Order ${orderRef} deferred (${reason}).`
    );
  };
  const handleReissue = (orderRef) => {
    return executeAction(
      api.reissue(orderRef),
      `Replacement order created for ${orderRef} in queue.`
    );
  };
  const handleLoaderChange = (vehicleId, loaderId) => {
    executeAction(api.loader(vehicleId, loaderId), `Loader updated for vehicle ${vehicleId}.`);
  };
  const notifySuccess = (m) => { setSuccessMsg(m); setTimeout(() => setSuccessMsg(""), 4000); };
  const notifyError = (m) => { setError(m); setTimeout(() => setError(""), 6000); };
  const stats = board?.stats || {};
  const availableVehicles = (board?.vehicles || []).filter((v) => v.vehicle.status === "available");
  const liveCount = (board?.vehicles || []).filter((v) => v.vehicle.departed).length;
  const modalVehicle = openVehicleModal && board?.vehicles?.find((v) => v.vehicle.id === openVehicleModal);
  const q = searchQuery.toLowerCase();
  const unallocatedList = (board?.orders || []).filter((o) =>
    (brandFilter === "All" || o.brand === brandFilter) &&
    (!q || o.orderRef.toLowerCase().includes(q) || o.outletId.toLowerCase().includes(q) || o.district.toLowerCase().includes(q)));
  const value = { board, error, setError, successMsg, setSuccessMsg, openVehicleModal, setOpenVehicleModal, deferringOrder, setDeferringOrder,
    brandFilter, setBrandFilter, searchQuery, setSearchQuery, dragOverTarget, setDragOverTarget, depot, setDepot, loadData, executeAction,
    handleDrop, handleUnassign, handleAutoAllocate, handleReset, handleConfirmDeferral, handleReissue, handleLoaderChange, stats, availableVehicles,
    modalVehicle, unallocatedList, setActiveNavTab, activeNavTab, liveCount, notifySuccess, notifyError };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
