import React from "react";
import FuelTab from "../../../components/FuelTab";
import { useDispatcher } from "../DispatcherContext";
export default function FuelPage() {
  const { depot, setOpenVehicleModal, notifySuccess, notifyError } = useDispatcher();
  return <FuelTab depot={depot} onShowSuccess={notifySuccess} onShowError={notifyError} />;
}
