import React, { useEffect, useState } from "react";
import { Download, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import orderAPI from "../apis/order.api";
import { useParams } from "react-router";
import { useNavigate } from "react-router";

const Invoice = () => {
  const [data, setData] = useState(null);
  const { orderId } = useParams();
  const navigator = useNavigate();

  useEffect(() => {
    orderAPI
      .get(`/trackOrder/${orderId}`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [orderId]);

  const downloadPDF = () => {
    const invoice = document.querySelector(".invoice-container");

    html2canvas(invoice, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("invoice.pdf");
    });
  };

  return (
    <div className="font-['Poppins',_sans-serif] bg-[#f8f9fa] dark:bg-[#071018] text-[#333] dark:text-gray-100 p-5 w-full max-w-full">
      <div className="invoice-container max-w-[800px] w-full my-[30px] mx-auto bg-[#fff] dark:bg-[#0b1220] border-[3px] border-solid border-[#FFBE86] dark:border-[#4b2f14] rounded-[8px] shadow-md dark:shadow-[0_10px_30px_rgba(2,6,23,0.6)] p-[40px] max-xs:p-[13px]">

        {/* Header */}
        <div className="invoice-header flex flex-wrap justify-between items-center border-b-[1px_solid_#eee] dark:border-b-[1px_solid_rgba(255,255,255,0.04)] pb-[20px] mb-[20px]">
          <h1 className="yumify-logo-text font-['Pacifico',cursive] text-prim text-[40px] max-sm:text-[30px] flex items-center">
            <button onClick={() => navigator('/')} className="mr-2 text-gray-700 dark:text-gray-200">
              <ArrowLeft size={32} />
            </button>
            Yumify
          </h1>

          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 max-sm:text-[25px]">
            INVOICE
          </h2>
        </div>

        {/* Details */}
        <div className="invoice-details grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-[25px]">
          <div>
            <p className="font-semibold text-gray-600 dark:text-gray-300">INVOICE NO:</p>
            <p className="break-words text-gray-800 dark:text-gray-100">#INV-{data?._id}</p>
          </div>

          <div className="md:text-right">
            <p className="font-semibold text-gray-600 dark:text-gray-300">DATE:</p>
            <p className="break-words text-gray-800 dark:text-gray-100">{data?.createdAt}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-600 dark:text-gray-300">BILLED TO:</p>
            <p className="font-medium text-gray-800 dark:text-gray-100">{data?.customer?.name}</p>
            <p className="break-words text-gray-700 dark:text-gray-300">{data?.deliveryAddress}</p>
            <p className="break-words text-gray-700 dark:text-gray-300">{data?.customer?.email}</p>
          </div>

          <div className="md:text-right">
            <p className="font-semibold text-gray-600 dark:text-gray-300">ORDER NO:</p>
            <p className="break-words text-gray-800 dark:text-gray-100">#{data?._id}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="item-table mb-[25px] overflow-x-auto w-full">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="w-1/2 text-left max-xs:text-[12px] text-gray-700 dark:text-gray-300">ITEM DESCRIPTION</th>
                <th className="text-center max-xs:text-[12px] text-gray-700 dark:text-gray-300">QTY</th>
                <th className="text-right max-xs:text-[12px] text-gray-700 dark:text-gray-300">UNIT PRICE</th>
                <th className="text-right max-xs:text-[12px] text-gray-700 dark:text-gray-300">TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {data?.subOrders?.flatMap((sub) => sub.items)?.map((item) => (
                <tr key={item?.food?._id} className="border-b border-[#eee] dark:border-gray-200/35">
                  <td className="break-words text-gray-800 dark:text-gray-100">{item?.food?.name}</td>
                  <td className="text-center text-gray-700 dark:text-gray-300">{item?.quantity}</td>
                  <td className="text-right text-gray-700 dark:text-gray-300">$ {item?.food?.price?.toFixed(2)}</td>
                  <td className="text-right text-gray-800 dark:text-gray-100">
                    $
                    {(
                      data?.subOrders
                        ?.flatMap((s) => s.items)
                        ?.reduce((t, x) => t + x.food.price * x.quantity, 0)
                    )?.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* if no items, show empty row (keeps layout stable)
              {!data?.subOrders?.flatMap((sub) => sub.items)?.length && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-600 dark:text-gray-400">No items found</td>
                </tr>
              )} */}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="summary-table flex justify-end mb-[25px]">
          <table className="w-full md:w-1/2">
            <tbody>
              <tr>
                <td className="text-gray-700 dark:text-gray-300">SUBTOTAL</td>
                <td className="text-right text-gray-800 dark:text-gray-100">$ {data?.totalPrice?.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="text-gray-700 dark:text-gray-300">TAX (5%)</td>
                <td className="text-right text-gray-800 dark:text-gray-100">$ {(data?.totalPrice * 0.05)?.toFixed(2)}</td>
              </tr>
              <tr className="text-lg">
                <td className="text-gray-700 dark:text-gray-300">GRAND TOTAL</td>
                <td className="font-bold text-right text-gray-900 dark:text-gray-50">$ {(data?.totalPrice * 1.05)?.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="invoice-footer border-t border-gray-200 dark:border-gray-200/35 pt-6 mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Thank you for your business! We hope to see you again soon.
          </p>
        </div>

        {/* Buttons */}
        <div className="no-print flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={() => window.print()}
            className="bg-[#f0f0f0] dark:bg-[#0f1724] text-[#555] dark:text-gray-200 p-[12px_25px] rounded-[8px] font-[600]"
          >
            <Download className="inline w-5 h-5 mr-2" /> Print
          </button>

          <button
            onClick={downloadPDF}
            className="bg-[#F97316] hover:bg-[#ea6b10] text-white p-[12px_25px] rounded-[8px] font-[600]"
          >
            <Download className="inline w-5 h-5 mr-2" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
