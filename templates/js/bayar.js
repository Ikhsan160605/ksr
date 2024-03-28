// Fungsi untuk menambahkan baris ke tabel hasil inputan user
function addUserInputRow(nama, harga) {
    const tableBody = document.getElementById("userInputTable");
    const row = `
        <tr>
            <td class="border border-gray-400 px-4 py-2">${nama}</td>
            <td class="border border-gray-400 px-4 py-2">${harga}</td>
        </tr>
    `;
    tableBody.innerHTML += row;
}

// Contoh penggunaan fungsi addUserInputRow
addUserInputRow("Pizza Pepperoni", "Rp. 50.000");
addUserInputRow("Pizza Margherita", "Rp. 45.000");
