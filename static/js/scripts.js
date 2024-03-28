function navigateToPembayaran() {
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  const selectedMenus = []; // Array untuk menyimpan daftar menu yang dipilih
  let totalPrice = 0; // Variabel untuk menyimpan total harga
  let totalQuantity = 0; // Variabel untuk menyimpan total jumlah pesanan

  checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
          const nama = checkbox.id;
          const harga = parseFloat(checkbox.value);
          const qtyInput = document.querySelector(`input[type='number'][id='${nama}_qty']`);
          const qty = qtyInput ? parseInt(qtyInput.value) : 1; 
          selectedMenus.push({
              nama: nama,
              harga: harga,
              jumlah: qty 
          });

          totalPrice += harga * qty;
          
          totalQuantity += qty;
      }
  });

// Arahkan pengguna ke halaman pembayaran.html dengan menyertakan total harga, total jumlah pesanan, daftar menu
const params = new URLSearchParams();
params.append("totalHarga", totalPrice);
params.append("totalQuantity", totalQuantity);
params.append("menus", JSON.stringify(selectedMenus));

fetch('/bayar', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // Ubah tipe konten menjadi application/x-www-form-urlencoded
  },
  body: params // Mengirim data sebagai formulir URL terenkripsi
})
.then(response => response.json())
.then(data => {
  console.log(data);
  // Redirect ke halaman pembayaran.html dengan menyertakan total harga, total jumlah pesanan, dan daftar menu
  window.location.href = `/pembayaran.html?totalHarga=${totalPrice}&totalQuantity=${totalQuantity}&menus=${encodeURIComponent(JSON.stringify(selectedMenus))}`;
})
.catch(error => console.error("Error:", error));

}



document.addEventListener("DOMContentLoaded", function () {
  const menuList = document.getElementById("menuList");
  const totalPriceDisplay = document.getElementById("totalPrice");

  let totalPrice = 0; // Variabel untuk menyimpan total harga

  fetch("/get_pizza_data")
    .then((response) => response.json())
    .then((data) => {
      let currentCategory = ""; // Variabel untuk menyimpan kategori saat ini

      data.menu.forEach((item) => {
        // Jika kategori berubah, tambahkan tabel baru
        if (item.kategori !== currentCategory) {
          // Tutup tabel sebelumnya jika ada
          if (currentCategory !== "") {
            menuList.innerHTML += "</tbody></table>";
          }
          // Buat tabel baru untuk kategori baru
          menuList.innerHTML += `
                        <h1 class="font-bold mt-10 w-full">Kategori</h1>
                        <h1 class="mt-4 mb-2 font-bold w-full">(${item.kategori})</h1>
                        
                    `;
          // Perbarui kategori saat ini
          currentCategory = item.kategori;
        }

        // Tambahkan baris untuk setiap item
        const menuItem = `
                    <li>
                        <h1 class="w-full font-bold">${item.nama}</h1>
                        <h3>${item.deskripsi}</h3>
                        <h2>Rp.${item.harga}</h2>
                        <input type="number" id="${item.nama}_qty" value="1" min="1" style="width: 50px; margin-left: 10px;">
                        <h1>Klik disini <input type="checkbox" id="${item.nama}" value="${item.harga}"></h1>
                    </li>
                `;
        menuList.innerHTML += menuItem;
      });

      // Tutup tabel terakhir setelah iterasi selesai
      menuList.innerHTML += "</tbody></table>";

      // Tambahkan event listener untuk setiap checkbox
      const checkboxes = document.querySelectorAll("input[type='checkbox']");
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            const harga = parseFloat(this.value); // Ambil harga dari value checkbox
            const qtyInput = document.getElementById(`${this.id}_qty`); // Dapatkan input jumlah pesanan
            let qty = parseInt(qtyInput.value); // Ambil jumlah pesanan dari input
    
            // Perbarui jumlah pesanan sesuai dengan nilai input
            if (qty < 1) {
                qty = 1; // Pastikan jumlah pesanan minimal adalah 1
                qtyInput.value = 1; // Perbarui nilai input jika kurang dari 1
            }
    
            if (this.checked) {
                totalPrice += harga * qty; // Tambahkan harga kali jumlah pesanan jika checkbox diperiksa
            } else {
                totalPrice -= harga * qty; // Kurangi harga kali jumlah pesanan jika checkbox tidak diperiksa
            }
            // Perbarui tampilan total harga
            totalPriceDisplay.textContent = `Total Harga: Rp.${totalPrice.toLocaleString()}`;

            // Kirim total harga ke database.json
            fetch("/update_total_price", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    total: totalPrice
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Total harga telah diperbarui di database.");
            })
            .catch(error => console.error("Error:", error));
        });
    });
    
    })
    .catch((error) => console.error("Error:", error));
});



document.addEventListener("DOMContentLoaded", function () {
  const categories = document.querySelectorAll("a"); // Select all anchor elements
  const categoryTitle = document.getElementById("categoryTitle"); // Get the category title element

  // Function to fetch and display menu based on category
  const displayMenuByCategory = (categoryName) => {
    fetch("/get_pizza_data")
      .then((response) => response.json())
      .then((data) => {
        const menuContainer = document.getElementById("menuContainer");
        menuContainer.innerHTML = ""; // Clear existing content

        if (data.menu.length === 0) {
          menuContainer.innerHTML =
            "<p>No items available for this category</p>";
          return;
        }

        data.menu.forEach((item) => {
          if (categoryName === "allmenu" || item.kategori === categoryName) {
            // Display all items or filter by category
            const menuItem = `
                            <div class="p-6 bg-white rounded-md shadow-md food-container m-4">
                                <img src="/static/img/pizza/${
                                  item.gambar
                                }" class="w-full h-48 object-cover rounded-md mb-4">
                                <h2 class="text-xl font-semibold mb-2">${
                                  item.kategori
                                }</h2>
                                <h2 class="text-xl font-semibold mb-2">${
                                  item.nama
                                }</h2>
                                <p class="text-gray-700 mb-2">${
                                  item.deskripsi
                                }</p>
                                <p class="text-gray-800 font-semibold">Rp ${item.harga.toLocaleString()}</p>
                            </div>
                        `;
            menuContainer.innerHTML += menuItem;
          }
        });
      })
      .catch((error) => console.error("Error:", error));
  };

  // Initially display all menu items
  displayMenuByCategory("allmenu");

  // Event listener for category clicks
  categories.forEach((category) => {
    category.addEventListener("click", function (event) {
      event.preventDefault();
      const categoryName = this.id;
      categoryTitle.textContent = this.innerText;
      displayMenuByCategory(categoryName);
    });
  });
});

const navLinks = document.querySelector(".nav-links");
let isMenuOpen = false;

function onToggleMenu(e) {
  if (!isMenuOpen) {
    e.setAttribute("name", "close-outline");
    navLinks.classList.remove("hidden"); // Tampilkan menu
  } else {
    e.setAttribute("name", "menu-outline");
    navLinks.classList.add("hidden"); // Sembunyikan menu
  }
  isMenuOpen = !isMenuOpen;
}
setTimeout(() => {
  // Sembunyikan overlay dan modal loading
  document.getElementById("overlay").style.display = "none";
  document.getElementById("loadingModal").style.display = "none";
}, 3000);

const pesan = document.getElementById("pesan");
let isMenu = false;

function onToggleBar() {
  isMenu = !isMenu; // Toggle nilai isMenu
  if (!isMenu) {
    pesan.classList.remove("hidden"); // Sembunyikan elemen pesan
  } else {
    pesan.classList.add("hidden"); // Tampilkan elemen pesan
  }
}
