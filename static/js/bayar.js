function showNotificationAndRedirect() {
    alert("Pembayaran berhasil dilakukan!");
    // Mengarahkan kembali setelah 3 detik (3000 milidetik)
    setTimeout(function() {
        window.location.href = "/"; // Ganti dengan halaman yang Anda inginkan
    }, 3000);
}
// Fungsi untuk menambahkan baris ke tabel hasil inputan user
function addUserInputRow(nama, harga, jumlah) {
    const tableBody = document.getElementById("userInputTable");
    const formattedHarga = parseFloat(harga).toLocaleString("id-ID");
    const row = `
          <tr>
              <td class="border border-gray-400 px-4 py-2">${nama}</td>
              <td class="border border-gray-400 px-4 py-2">Rp. ${formattedHarga}</td>
              <td class="border border-gray-400 px-4 py-2">${jumlah}</td>
          </tr>
      `;
    tableBody.innerHTML += row;
}

document.addEventListener("DOMContentLoaded", function () {
    // Mendapatkan URL saat ini
    const urlParams = new URLSearchParams(window.location.search);
    const totalHarga = parseFloat(urlParams.get("totalHarga")).toLocaleString("id-ID");
    const menus = JSON.parse(decodeURIComponent(urlParams.get("menus")));

    // Menampilkan total harga yang dikirimkan oleh pengguna
    const totalHargaElement = document.getElementById("totalHarga");
    if (totalHargaElement) {
        totalHargaElement.textContent = `Total Harga: Rp. ${totalHarga}`;
    }

    // Menambahkan baris untuk setiap menu yang dipilih oleh pengguna
    const tableBody = document.getElementById("userInputTable");
    if (tableBody) {
        menus.forEach((menu) => {
            addUserInputRow(menu.nama, menu.harga, menu.jumlah);
        });
    }
});

// Mengambil nilai token dari elemen dengan id snap_token
var token = document.getElementById('snap_token').value;

// Mendapatkan tombol checkout
var checkoutBtn = document.getElementById('checkout-button');

// Menambahkan event listener untuk saat tombol checkout diklik
// Menambahkan event listener untuk saat tombol checkout diklik
checkoutBtn.addEventListener('click', function() {
    console.log('opening snap popup:');
  
    // Open Snap popup with defined callbacks.
    snap.pay(token, {
        onSuccess: function(result) {
            console.log("SUCCESS", result);
            alert("Pembayaran berhasil dilakukan");
            
            // Setelah pembayaran berhasil, arahkan kembali ke halaman awal
            window.location.href = "/";
        },
        onPending: function(result) {
            console.log("Payment pending", result);
            alert("Payment pending \r\n"+JSON.stringify(result));
        },
        onError: function() {
            console.log("Payment error");
        }
    });
    // For more advanced use, refer to: https://snap-docs.midtrans.com/#snap-js
});

