import { ReactElement } from "react";
import Swal, { SweetAlertIcon } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const swalAlert = (icon: SweetAlertIcon, title: ReactElement) => {
  return withReactContent(Swal).fire({
    title,
    icon,
  });
};

export async function tryInvoke(fn: () => any) {
  try {
    return await fn();
  } catch (e) {
    console.error(e);

    return e;
  }
}
