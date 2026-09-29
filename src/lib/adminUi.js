import Swal from "sweetalert2";

// `labels` = the admin dictionary's `confirm` block ({ cancel, delete }).
export async function confirmDanger(title, text, labels) {
  const res = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: labels.delete,
    cancelButtonText: labels.cancel,
    confirmButtonColor: "#c82828",
    cancelButtonColor: "#6e6961",
    reverseButtons: true,
    focusCancel: true,
  });
  return res.isConfirmed;
}
