document.addEventListener('DOMContentLoaded', () => {
    const season1Select = document.getElementById('season1Select');
    const season2Select = document.getElementById('season2Select');
    const compareSeasonsBtn = document.getElementById('compareSeasonsBtn');

    const summarySeason1Display = document.getElementById('summarySeason1Display');
    const summarySeason2Display = document.getElementById('summarySeason2Display');
    const summarySeason1List = document.getElementById('summarySeason1');
    const summarySeason2List = document.getElementById('summarySeason2');
    const comparisonOutputList = document.getElementById('comparisonOutput');

    // Yeni başlık span'ları için referanslar
    const season1BestByPositionDisplay = document.getElementById('season1BestByPositionDisplay');
    const season2BestByPositionDisplay = document.getElementById('season2BestByPositionDisplay');
    const season1TopGoalScorersDisplay = document.getElementById('season1TopGoalScorersDisplay');
    const season2TopGoalScorersDisplay = document.getElementById('season2TopGoalScorersDisplay');
    const season1TopAssistersDisplay = document.getElementById('season1TopAssistersDisplay');
    const season2TopAssistersDisplay = document.getElementById('season2TopAssistersDisplay');
    const season1TopRatedPlayersDisplay = document.getElementById('season1TopRatedPlayersDisplay');
    const season2TopRatedPlayersDisplay = document.getElementById('season2TopRatedPlayersDisplay');
    const season1TopPotentialPlayersDisplay = document.getElementById('season1TopPotentialPlayersDisplay');
    const season2TopPotentialPlayersDisplay = document.getElementById('season2TopPotentialPlayersDisplay');


    // Yeni tablo body'leri için referanslar
    const season1BestByPositionTableBody = document.querySelector('#season1BestByPositionTable tbody');
    const season2BestByPositionTableBody = document.querySelector('#season2BestByPositionTable tbody');
    const season1TopGoalScorersTableBody = document.querySelector('#season1TopGoalScorersTable tbody');
    const season2TopGoalScorersTableBody = document.querySelector('#season2TopGoalScorersTable tbody');
    const season1TopAssistersTableBody = document.querySelector('#season1TopAssistersTable tbody');
    const season2TopAssistersTableBody = document.querySelector('#season2TopAssistersTable tbody');
    const season1TopRatedPlayersTableBody = document.querySelector('#season1TopRatedPlayersTable tbody');
    const season2TopRatedPlayersTableBody = document.querySelector('#season2TopRatedPlayersTable tbody');
    const season1TopPotentialPlayersTableBody = document.querySelector('#season1TopPotentialPlayersTable tbody');
    const season2TopPotentialPlayersTableBody = document.querySelector('#season2TopPotentialPlayersTable tbody');


    let playersBySeason = loadPlayersBySeason(); // localStorage'dan sezon verilerini yükle

    // Oyuncu Pozisyonlarının Tanımlanması (index.js'ten kopyalandı)
    const playerPositionsOrder = [
        'GK', 'DC', 'DR', 'DL', 'DOS', 'MC', 'ML', 'MR', 'AMC', 'AMR', 'AML', 'ST', 'Diğer'
    ];

    // localStorage'dan sezon verilerini yükleyen fonksiyon (script.js'ten kopyalandı)
    function loadPlayersBySeason() {
        try {
            const storedData = localStorage.getItem('footballPlayersBySeason');
            return storedData ? JSON.parse(storedData) : {};
        } catch (e) {
            console.error("Local Storage'dan sezon verileri yüklenirken hata:", e);
            return {};
        }
    }

    // Sezon dropdown'larını doldur
    function populateSeasonSelects() {
        season1Select.innerHTML = '';
        season2Select.innerHTML = '';
        const seasons = Object.keys(playersBySeason).sort().reverse();

        if (seasons.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '--- Sezon Yok ---';
            season1Select.appendChild(option);
            season2Select.appendChild(option.cloneNode(true)); // Klonlayarak ikinciye de ekle
            season1Select.disabled = true;
            season2Select.disabled = true;
            compareSeasonsBtn.disabled = true;
            return;
        }

        season1Select.disabled = false;
        season2Select.disabled = false;
        compareSeasonsBtn.disabled = false;

        // Varsayılan olarak boş bir seçenek ekle
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Sezon Seçiniz';
        season1Select.appendChild(defaultOption.cloneNode(true));
        season2Select.appendChild(defaultOption.cloneNode(true));

        seasons.forEach(season => {
            const option1 = document.createElement('option');
            option1.value = season;
            option1.textContent = season;
            season1Select.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = season;
            option2.textContent = season;
            season2Select.appendChild(option2);
        });

        // Başlangıçta dropdown'larda seçili sezonları ayarla (eğer yeterli sezon varsa)
        if (seasons.length >= 2) {
            season1Select.value = seasons[0];
            season2Select.value = seasons[1];
        } else if (seasons.length === 1) {
            season1Select.value = seasons[0];
            season2Select.value = seasons[0]; // Tek sezon varsa ikisini de aynı yap
        } else {
            season1Select.value = '';
            season2Select.value = '';
        }
        updateSummaryDisplays(); // Başlangıçta özetleri göster
    }

    // Seçilen sezonlara göre özetleri ve detay listelerini güncelle
    function updateSummaryDisplays() {
        const season1 = season1Select.value;
        const season2 = season2Select.value;

        summarySeason1Display.textContent = season1 ? `Sezon: ${season1}` : 'Seçili Sezon Yok';
        summarySeason2Display.textContent = season2 ? `Sezon: ${season2}` : 'Seçili Sezon Yok';

        // Detaylı liste başlıklarını güncelle
        season1BestByPositionDisplay.textContent = season1 ? `(${season1})` : '';
        season2BestByPositionDisplay.textContent = season2 ? `(${season2})` : '';
        season1TopGoalScorersDisplay.textContent = season1 ? `(${season1})` : '';
        season2TopGoalScorersDisplay.textContent = season2 ? `(${season2})` : '';
        season1TopAssistersDisplay.textContent = season1 ? `(${season1})` : '';
        season2TopAssistersDisplay.textContent = season2 ? `(${season2})` : '';
        season1TopRatedPlayersDisplay.textContent = season1 ? `(${season1})` : '';
        season2TopRatedPlayersDisplay.textContent = season2 ? `(${season2})` : '';
        season1TopPotentialPlayersDisplay.textContent = season1 ? `(${season1})` : '';
        season2TopPotentialPlayersDisplay.textContent = season2 ? `(${season2})` : '';
    }


    // İstatistikleri ve oyuncu listesini hesaplayan yardımcı fonksiyon
    function calculateSeasonStats(seasonData) {
        let totalPlayers = 0;
        let localCount = 0;
        let foreignCount = 0;
        let totalGoals = 0;
        let totalAssists = 0;
        let totalAvgRatingSum = 0; // Ortalama puanların toplamı
        let playersWithRatingCount = 0; // Ortalama puana sahip oyuncu sayısı
        let allPlayers = []; // Tüm oyuncuları da döndür
        let bestPlayersByPosition = []; // Pozisyonlara göre en iyi oyuncular

        if (seasonData && seasonData.length > 0) {
            allPlayers = seasonData; // Tüm oyuncular
            totalPlayers = seasonData.length;

            const statsByPosition = {}; // Pozisyona göre stats oluştur
            seasonData.forEach(player => {
                // Pozisyona göre istatistikleri ve en iyi oyuncuyu güncelle
                if (!statsByPosition[player.position]) {
                    statsByPosition[player.position] = { bestPlayer: null };
                }

                if (typeof player.avgRating === 'number' && !isNaN(player.avgRating)) {
                    if (!statsByPosition[player.position].bestPlayer || player.avgRating > statsByPosition[player.position].bestPlayer.avgRating) {
                        statsByPosition[player.position].bestPlayer = player;
                    }
                }

                if (player.isForeign) {
                    foreignCount++;
                } else {
                    localCount++;
                }
                totalGoals += typeof player.goals === 'number' ? player.goals : 0;
                totalAssists += typeof player.assists === 'number' ? player.assists : 0;
                
                if (typeof player.avgRating === 'number' && !isNaN(player.avgRating)) {
                    totalAvgRatingSum += player.avgRating;
                    playersWithRatingCount++;
                }
            });

            // Pozisyonlara göre en iyi oyuncuları listeye ekle
            for (const posOrder of playerPositionsOrder) {
                if (statsByPosition[posOrder] && statsByPosition[posOrder].bestPlayer) {
                    bestPlayersByPosition.push(statsByPosition[posOrder].bestPlayer);
                }
            }
        }
        
        const avgRating = playersWithRatingCount > 0 ? (totalAvgRatingSum / playersWithRatingCount) : 0;

        return {
            totalPlayers,
            localCount,
            foreignCount,
            totalGoals,
            totalAssists,
            avgRating: avgRating.toFixed(2), // 2 ondalık basamakla formatla
            players: allPlayers, // Tüm oyuncuların listesi
            bestPlayersByPosition: bestPlayersByPosition // Pozisyona göre en iyi oyuncuların listesi
        };
    }

    // Tabloyu dolduran yardımcı fonksiyon
    function populatePlayerListTable(tbody, playersData, valueKey, formatFn = val => (typeof val === 'number' ? val.toLocaleString() : '0')) {
        tbody.innerHTML = ''; // Tabloyu temizle
        if (!playersData || playersData.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 2; // Adı ve Değer sütunu
            cell.textContent = "Veri bulunmamaktadır.";
            return;
        }

        playersData.forEach(player => {
            const row = tbody.insertRow();
            const nameCell = row.insertCell();
            nameCell.textContent = player.name || '';
            const valueCell = row.insertCell();
            // Değeri formatla veya doğrudan kullan
            valueCell.textContent = formatFn(player[valueKey]);
        });
    }

    // Pozisyona göre en iyi oyuncuları tabloya dolduran özel yardımcı fonksiyon
    function populateBestByPositionTable(tbody, playersData, valueKey, formatFn = val => (typeof val === 'number' ? val.toFixed(2) : '0')) {
        tbody.innerHTML = '';
        if (!playersData || playersData.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3; // Pozisyon, Adı, Ort. Puan sütunları
            cell.textContent = "Veri bulunmamaktadır.";
            return;
        }

        // Pozisyon sırasına göre sırala
        playersData.sort((a, b) => {
            const posA = playerPositionsOrder.indexOf(a.position);
            const posB = playerPositionsOrder.indexOf(b.position);
            return posA - posB;
        });

        playersData.forEach(player => {
            const row = tbody.insertRow();
            row.insertCell().textContent = player.position || '';
            row.insertCell().textContent = player.name || '';
            row.insertCell().textContent = formatFn(player[valueKey]);
        });
    }


    // Kıyaslama butonuna tıklama dinleyicisi
    compareSeasonsBtn.addEventListener('click', () => {
        const season1 = season1Select.value;
        const season2 = season2Select.value;

        if (!season1 || season1 === 'Sezon Seçiniz' || !season2 || season2 === 'Sezon Seçiniz') {
            alert("Lütfen kıyaslamak için iki sezon seçin.");
            return;
        }
        if (season1 === season2) {
            alert("Lütfen farklı iki sezon seçin.");
            return;
        }

        const season1Stats = calculateSeasonStats(playersBySeason[season1]);
        const season2Stats = calculateSeasonStats(playersBySeason[season2]);

        // Özet listelerini güncelle
        summarySeason1List.innerHTML = `
            <li>Toplam Oyuncu: ${season1Stats.totalPlayers}</li>
            <li>Yerli Oyuncu: ${season1Stats.localCount}</li>
            <li>Yabancı Oyuncu: ${season1Stats.foreignCount}</li>
            <li>Toplam Gol: ${season1Stats.totalGoals}</li>
            <li>Toplam Asist: ${season1Stats.totalAssists}</li>
            <li>Ort. Puan: ${season1Stats.avgRating}</li>
        `;
        summarySeason2List.innerHTML = `
            <li>Toplam Oyuncu: ${season2Stats.totalPlayers}</li>
            <li>Yerli Oyuncu: ${season2Stats.localCount}</li>
            <li>Yabancı Oyuncu: ${season2Stats.foreignCount}</li>
            <li>Toplam Gol: ${season2Stats.totalGoals}</li>
            <li>Toplam Asist: ${season2Stats.totalAssists}</li>
            <li>Ort. Puan: ${season2Stats.avgRating}</li>
        `;

        // Kıyaslama sonuçlarını hesapla ve göster
        comparisonOutputList.innerHTML = `
            <li>Oyuncu Sayısı Farkı: ${season2Stats.totalPlayers - season1Stats.totalPlayers}</li>
            <li>Yerli Oyuncu Farkı: ${season2Stats.localCount - season1Stats.localCount}</li>
            <li>Yabancı Oyuncu Farkı: ${season2Stats.foreignCount - season1Stats.foreignCount}</li>
            <li>Gol Farkı: ${season2Stats.totalGoals - season1Stats.totalGoals}</li>
            <li>Asist Farkı: ${season2Stats.totalAssists - season1Stats.totalAssists}</li>
            <li>Ort. Puan Farkı: ${(parseFloat(season2Stats.avgRating) - parseFloat(season1Stats.avgRating)).toFixed(2)}</li>
        `;

        // En İyi 5 yardımcı fonksiyonu (Oyuncuların listesini bekler)
        const getTopPlayersForComparison = (playersList, metric, count = 5, formatFn = val => val) => {
            const filtered = playersList.filter(p => typeof p[metric] === 'number' && !isNaN(p[metric]));
            if (filtered.length === 0) return [];
            // Sort by metric (descending), then by name (ascending)
            return filtered.slice().sort((a, b) => {
                if (b[metric] !== a[metric]) {
                    return b[metric] - a[metric];
                }
                return a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
            }).slice(0, count);
        };

        // Pozisyona göre en iyi oyuncular tablolarını doldur
        populateBestByPositionTable(
            season1BestByPositionTableBody, 
            season1Stats.bestPlayersByPosition, 
            'avgRating', 
            val => typeof val === 'number' ? val.toFixed(2) : '0'
        );
        populateBestByPositionTable(
            season2BestByPositionTableBody, 
            season2Stats.bestPlayersByPosition, 
            'avgRating', 
            val => typeof val === 'number' ? val.toFixed(2) : '0'
        );

        // Diğer Top 5 Listelerini doldur
        populatePlayerListTable(
            season1TopGoalScorersTableBody, 
            getTopPlayersForComparison(season1Stats.players, 'goals', 5), 
            'goals', 
            val => typeof val === 'number' ? val.toLocaleString() : '0'
        );
        populatePlayerListTable(
            season2TopGoalScorersTableBody, 
            getTopPlayersForComparison(season2Stats.players, 'goals', 5), 
            'goals', 
            val => typeof val === 'number' ? val.toLocaleString() : '0'
        );

        populatePlayerListTable(
            season1TopAssistersTableBody, 
            getTopPlayersForComparison(season1Stats.players, 'assists', 5), 
            'assists', 
            val => typeof val === 'number' ? val.toLocaleString() : '0'
        );
        populatePlayerListTable(
            season2TopAssistersTableBody, 
            getTopPlayersForComparison(season2Stats.players, 'assists', 5), 
            'assists', 
            val => typeof val === 'number' ? val.toLocaleString() : '0'
        );

        populatePlayerListTable(
            season1TopRatedPlayersTableBody, 
            getTopPlayersForComparison(season1Stats.players, 'avgRating', 5), 
            'avgRating', 
            val => typeof val === 'number' ? val.toFixed(2) : '0'
        );
        populatePlayerListTable(
            season2TopRatedPlayersTableBody, 
            getTopPlayersForComparison(season2Stats.players, 'avgRating', 5), 
            'avgRating', 
            val => typeof val === 'number' ? val.toFixed(2) : '0'
        );

        populatePlayerListTable(
            season1TopPotentialPlayersTableBody, 
            getTopPlayersForComparison(season1Stats.players, 'potential', 5), 
            'potential', 
            val => typeof val === 'number' ? val.toLocaleString() : '0'
        );
        populatePlayerListTable(
            season2TopPotentialPlayersTableBody, 
            getTopPlayersForComparison(season2Stats.players, 'potential', 5), 
            'potential', 
            val => typeof val === 'number' ? val.toLocaleString() : '0'
        );
    });

    // Sayfa yüklendiğinde ve seçili sezonlar değiştiğinde dropdown'ları ve özetleri güncelle
    season1Select.addEventListener('change', updateSummaryDisplays);
    season2Select.addEventListener('change', updateSummaryDisplays);

    populateSeasonSelects(); // Sayfa yüklendiğinde sezon dropdown'larını doldur
});


<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBz5Vs77WYsf_I8y7YzHVIVMKpfGiImh8o",
    authDomain: "fm-veri.firebaseapp.com",
    projectId: "fm-veri",
    storageBucket: "fm-veri.firebasestorage.app",
    messagingSenderId: "740937341711",
    appId: "1:740937341711:web:c610ec54779447be787c7a",
    measurementId: "G-1ELM9KSY6T"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
