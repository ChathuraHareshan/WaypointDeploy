import React from "react";
import CapacityTab from "../../../components/CapacityTab";
import { useDispatcher } from "../DispatcherContext";
export default function CapacityPage() {
  const { depot, setOpenVehicleModal, notifySuccess, notifyError } = useDispatcher();
  return <CapacityTab depot={depot} onShowSuccess={notifySuccess} onShowError={notifyError} />;
}
