import { toast } from "react-hot-toast";
import InputToastBox from "../components/InputToastBox";

export default function showInputToast(callback) {
  toast.custom((t) => (
    <InputToastBox t={t} callback={callback} />
  ));
}
