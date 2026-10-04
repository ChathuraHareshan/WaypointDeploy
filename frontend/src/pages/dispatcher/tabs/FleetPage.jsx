import React from "react";
import FleetTab from "../../../components/FleetTab";
import { useDispatcher } from "../DispatcherContext";
export default function FleetPage() {
  const { depot, setOpenVehicleModal, notifySuccess, notifyError } = useDispatcher();
  return <FleetTab depot={depot} onOpenRouteModal={(vid) => setOpenVehicleModal(vid)} onShowSuccess={notifySuccess} onShowError={notifyError} />;
}
