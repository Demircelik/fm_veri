document.addEventListener('DOMContentLoaded', () => {
    // HTML Elementlerini Güvenli Bir Şekilde Alma
    const getElement = (id) => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Hata: HTML elementi bulunamadı: #${id}`);
        }
        return element;
    };

    const playerForm = getElement('playerForm');
    const playerNameInput = getElement('playerName');
    const playerPotentialInput = getElement('playerPotential');
    const playerPositionSelect = getElement('playerPosition');
    const playerMatchesInput = getElement('playerMatches');
    const playerGoalsInput = getElement('playerGoals');
    const playerAssistsInput = getElement('playerAssists');
    const playerAvgRatingInput = getElement('playerAvgRating');
    const isForeignCheckbox = getElement('isForeign');
    const playerTableBody = document.querySelector('#playerTable tbody');
    const positionFilter = getElement('positionFilter');
    const analysisOutput = getElement('analysisOutput');

    const currentSeasonSelect = getElement('currentSeasonSelect');
    const newSeasonInput = getElement('newSeasonInput'); 
    const addSeasonBtn = getElement('addSeasonBtn');

    const activeSeasonDisplay = getElement('activeSeasonDisplay');
    const displaySeasonDisplay = getElement('displaySeasonDisplay');
    const analysisSeasonDisplay = getElement('analysisSeasonDisplay');

    const csvFileInput = getElement('csvFileInput');
    const importCsvBtn = getElement('importCsvBtn');
    const exportCsvBtn = getElement('exportCsvBtn');

    // Karanlık mod butonu ve ilgili kodlar kaldırıldı
    // const darkModeToggleBtn = getElement('darkModeToggleBtn'); 

    // Oyuncu Düzenleme Modu için Değişkenler
    let isEditMode = false;
    let playerBeingEditedId = null;
    const submitButton = playerForm ? playerForm.querySelector('button[type="submit"]') : null;

    // Oyuncu Pozisyonlarının Tanımlanması (sıralama ve filtreleme için)
    const playerPositionsOrder = [
        'GK', 'DC', 'DR', 'DL', 'DOS', 'MC', 'ML', 'MR', 'AMC', 'AMR', 'AML', 'ST', 'Diğer'
    ];

    let playersBySeason = loadPlayersBySeason();
    let currentSeason = localStorage.getItem('currentFootballSeason') || '';

    // --- Karanlık Mod Fonksiyonları (Kaldırıldı) ---
    /*
    function enableDarkMode() { ... }
    function disableDarkMode() { ... }
    if (localStorage.getItem('darkMode') === 'enabled') { ... }
    if (darkModeToggleBtn) { ... }
    */

    // --- Sezon Yönetimi Fonksiyonları ---
    function loadPlayersBySeason() {
        try {
            const storedData = localStorage.getItem('footballPlayersBySeason');
            return storedData ? JSON.parse(storedData) : {};
        } catch (e) {
            console.error("Local Storage'dan sezon verileri yüklenirken hata:", e);
            return {};
        }
    }

    function savePlayersBySeason() {
        try {
            localStorage.setItem('footballPlayersBySeason', JSON.stringify(playersBySeason));
        } catch (e) {
            console.error("Local Storage'a sezon verileri kaydedilirken hata:", e);
        }
    }

    function updateSeasonSelect() {
        if (!currentSeasonSelect) return;

        currentSeasonSelect.innerHTML = '';
        const seasons = Object.keys(playersBySeason).sort().reverse();

        if (seasons.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '--- Sezon Yok ---';
            currentSeasonSelect.appendChild(option);
            currentSeasonSelect.disabled = true;
            currentSeason = '';
            console.log("Sezon yok, select kutusu devre dışı bırakıldı.");
        } else {
            seasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season;
                option.textContent = season;
                currentSeasonSelect.appendChild(option);
            });
            currentSeasonSelect.disabled = false; // Enabled yap
            
            // Eğer seçili sezon yoksa veya mevcut sezonlar arasında değilse, en yeniyi seç
            if (!currentSeason || !seasons.includes(currentSeason)) {
                currentSeason = seasons[0]; // En yeni sezonu seç
                localStorage.setItem('currentFootballSeason', currentSeason); // Seçili sezonu kaydet
                console.log(`Geçerli sezon tanımlı değil veya bulunamadı, en yeni sezon '${currentSeason}' seçildi.`);
            }
            currentSeasonSelect.value = currentSeason;
            console.log(`Geçerli sezon: ${currentSeason}`);
        }
        
        updateSeasonDisplays();
        renderPlayers();
        updateAnalysis();
    }

    function updateSeasonDisplays() {
        if (activeSeasonDisplay) activeSeasonDisplay.textContent = currentSeason ? `Sezon: ${currentSeason}` : 'Seçili Sezon Yok';
        if (displaySeasonDisplay) displaySeasonDisplay.textContent = currentSeason ? `Sezon: ${currentSeason}` : 'Seçili Sezon Yok';
        if (analysisSeasonDisplay) analysisSeasonDisplay.textContent = currentSeason ? `Sezon: ${currentSeason}` : 'Seçili Sezon Yok';
    }

    // Yeni sezon ekleme butonu dinleyicisi
    if (addSeasonBtn) {
        addSeasonBtn.addEventListener('click', () => {
            const newSeason = newSeasonInput.value.trim();
            const seasonRegex = /^\d{4}-\d{4}$/;
            if (!seasonRegex.test(newSeason)) {
                alert("Geçersiz sezon formatı. Lütfen ızara-YYYY formatında girin (örn: 2024-2025).");
                return;
            }
            const startYear = parseInt(newSeason.substring(0, 4));
            const endYear = parseInt(newSeason.substring(5, 9));
            if (endYear !== startYear + 1) {
                alert("Sezon aralığı doğru değil. İkinci yıl ilk yıldan bir sonraki yıl olmalıdır (örn: 2024-2025).");
                return;
            }

            if (newSeason && !playersBySeason[newSeason]) {
                playersBySeason[newSeason] = [];
                savePlayersBySeason();
                newSeasonInput.value = '';
                currentSeason = newSeason;
                updateSeasonSelect();
                alert(`'${newSeason}' sezonu başarıyla eklendi ve seçildi.`);
            } else if (newSeason && playersBySeason[newSeason]) {
                alert(`'${newSeason}' sezonu zaten mevcut.`);
            } else {
                alert("Lütfen bir sezon adı girin.");
            }
        });
    }

    // Sezon seçimi değiştiğinde
    if (currentSeasonSelect) {
        currentSeasonSelect.addEventListener('change', () => {
            currentSeason = currentSeasonSelect.value;
            localStorage.setItem('currentFootballSeason', currentSeason);
            updateSeasonDisplays();
            renderPlayers();
            updateAnalysis();
        });
    }

    // --- Oyuncu Yönetimi Fonksiyonları ---

    // Oyuncu ekleme/güncelleme formunu dinle
    if (playerForm) {
        playerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!currentSeason) {
                alert("Lütfen önce bir sezon seçin veya yeni bir sezon ekleyin.");
                return;
            }

            const playerData = {
                name: playerNameInput.value.trim(),
                potential: parseInt(playerPotentialInput.value),
                position: playerPositionSelect.value,
                matches: parseInt(playerMatchesInput.value),
                goals: parseInt(playerGoalsInput.value),
                assists: parseInt(playerAssistsInput.value),
                avgRating: parseFloat(playerAvgRatingInput.value),
                isForeign: isForeignCheckbox.checked
            };

            // Veri Doğrulamaları
            if (!playerData.name || !playerData.position) {
                alert("Oyuncu Adı ve Pozisyon boş bırakılamaz!");
                return;
            }
            if (isNaN(playerData.potential) || playerData.potential < 0 || playerData.potential > 200) {
                alert("Potansiyel değeri 0 ile 200 arasında bir sayı olmalıdır!");
                return;
            }
            if (isNaN(playerData.avgRating) || playerData.avgRating < 0 || playerData.avgRating > 10) {
                alert("Ortalama Puan 0 ile 10 arasında bir sayı olmalıdır!");
                return;
            }
            if (isNaN(playerData.matches) || isNaN(playerData.goals) || isNaN(playerData.assists)) {
                alert("Maç, Gol ve Asist sayıları geçerli sayılar olmalıdır!");
                return;
            }


            let playersInCurrentSeason = playersBySeason[currentSeason] || [];

            if (isEditMode) {
                const playerIndex = playersInCurrentSeason.findIndex(p => p.id === playerBeingEditedId);
                if (playerIndex !== -1) {
                    if (playersInCurrentSeason[playerIndex].name.toLowerCase() !== playerData.name.toLowerCase()) {
                        const nameExists = playersInCurrentSeason.some((p, idx) => idx !== playerIndex && p.name.toLowerCase() === playerData.name.toLowerCase());
                        if (nameExists) {
                            alert(`Hata: '${playerData.name}' isimli başka bir oyuncu zaten mevcut.`);
                            return;
                        }
                    }

                    playersInCurrentSeason[playerIndex].name = playerData.name;
                    playersInCurrentSeason[playerIndex].potential = playerData.potential;
                    playersInCurrentSeason[playerIndex].position = playerData.position;
                    playersInCurrentSeason[playerIndex].matches = playerData.matches;
                    playersInCurrentSeason[playerIndex].goals = playerData.goals;
                    playersInCurrentSeason[playerIndex].assists = playerData.assists;
                    playersInCurrentSeason[playerIndex].avgRating = playerData.avgRating;
                    playersInCurrentSeason[playerIndex].isForeign = playerData.isForeign;

                    alert(`'${playerData.name}' oyuncusu başarıyla güncellendi.`);
                }
                isEditMode = false;
                playerBeingEditedId = null;
                if (submitButton) {
                     submitButton.textContent = "Oyuncu Ekle";
                }
            } else {
                const nameExists = playersInCurrentSeason.some(p => p.name.toLowerCase() === playerData.name.toLowerCase());
                if (nameExists) {
                    alert(`Hata: '${playerData.name}' isimli oyuncu bu sezonda zaten mevcut.`);
                    return;
                }

                playerData.id = Date.now();
                playersInCurrentSeason.push(playerData);
                alert(`'${playerData.name}' oyuncusu başarıyla eklendi.`);
            }

            playersBySeason[currentSeason] = playersInCurrentSeason;
            savePlayersBySeason();
            renderPlayers();
            updateAnalysis();
            playerForm.reset();
            playerNameInput.focus();
        });
    }

    // --- Oyuncu Düzenleme İşlevi ---
    function editPlayer(playerId) {
        if (!currentSeason || !playersBySeason[currentSeason]) {
            alert("Düzenlenecek oyuncu bulunamadı (sezon seçili değil veya boş).");
            return;
        }
        const playersInCurrentSeason = playersBySeason[currentSeason];
        const playerToEdit = playersInCurrentSeason.find(p => p.id === playerId);

        if (playerToEdit) {
            playerNameInput.value = playerToEdit.name;
            playerPotentialInput.value = playerToEdit.potential;
            playerPositionSelect.value = playerToEdit.position;
            playerMatchesInput.value = playerToEdit.matches;
            playerGoalsInput.value = playerToEdit.goals;
            playerAssistsInput.value = playerToEdit.assists;
            playerAvgRatingInput.value = playerToEdit.avgRating;
            isForeignCheckbox.checked = playerToEdit.isForeign;

            isEditMode = true;
            playerBeingEditedId = playerId;
            if (submitButton) {
                submitButton.textContent = "Oyuncuyu Güncelle";
            }
            playerNameInput.focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert("Düzenlenecek oyuncu bulunamadı.");
        }
    }

    // --- Oyuncu Silme İşlevi (Tekli) ---
    function deletePlayer(playerId) {
        if (!currentSeason || !playersBySeason[currentSeason]) {
            alert("Silinecek oyuncu bulunamadı (sezon seçili değil veya boş).");
            return;
        }
        if (confirm("Bu oyuncuyu silmek istediğinizden emin misiniz?")) {
            playersBySeason[currentSeason] = playersBySeason[currentSeason].filter(player => player.id !== playerId);
            savePlayersBySeason();
            renderPlayers(); // Silme sonrası yeniden numaralandırma ve render
            updateAnalysis();
            alert("Oyuncu silindi.");
        }
    }

    // --- Filtreleme seçeneğini dinle ---
    if (positionFilter) {
        positionFilter.addEventListener('change', () => {
            renderPlayers();
        });
    }

    // --- Oyuncuları tabloya render et ve numaralandır ---
    function renderPlayers() {
        if (!playerTableBody) return;

        playerTableBody.innerHTML = '';

        if (!currentSeason || !playersBySeason[currentSeason] || playersBySeason[currentSeason].length === 0) {
            playerTableBody.innerHTML = '<tr><td colspan="10">Lütfen bir sezon seçin veya yeni bir sezon ekleyin.</td></tr>';
            return;
        }

        let playersInCurrentSeason = playersBySeason[currentSeason];
        const filterValue = positionFilter ? positionFilter.value : 'Tümü';

        let filteredPlayers = playersInCurrentSeason.filter(player => {
            return filterValue === 'Tümü' || player.position === filterValue;
        });

        if (filteredPlayers.length === 0) {
            playerTableBody.innerHTML = '<tr><td colspan="10">Gösterilecek oyuncu bulunmamaktadır.</td></tr>';
            return;
        }

        // 1. Pozisyona göre sıralama
        filteredPlayers.sort((a, b) => {
            const posA = playerPositionsOrder.indexOf(a.position);
            const posB = playerPositionsOrder.indexOf(b.position);
            if (posA !== posB) {
                return posA - posB;
            }
            // Aynı pozisyondaysa isme göre sıralama (alfabetik)
            return a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
        });

        // 2. Yeniden numaralandırma
        let currentNo = 1;
        filteredPlayers.forEach(player => {
            player.no = currentNo.toString(); // Numarayı güncelle
            currentNo++;
        });

        // HTML'e render et
        filteredPlayers.forEach(player => {
            const row = playerTableBody.insertRow();
            row.innerHTML = `
                <td>${player.no}</td>
                <td>${player.name}</td>
                <td>${player.position}</td>
                <td>${player.potential}</td>
                <td>${player.matches}</td>
                <td>${player.goals}</td>
                <td>${player.assists}</td>
                <td>${typeof player.avgRating === 'number' ? player.avgRating.toFixed(2) : '0'}</td>
                <td>${player.isForeign ? 'Evet' : 'Hayır'}</td>
                <td>
                    <button class="edit-btn" data-id="${player.id}">Düzenle</button>
                    <button class="delete-btn" data-id="${player.id}">Sil</button>
                </td>
            `;
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                editPlayer(parseInt(e.target.dataset.id));
            });
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                deletePlayer(parseInt(e.target.dataset.id));
            });
        });

        // Numaralandırma ve sıralama sonrası localStorage'ı kaydet (önemli!)
        playersBySeason[currentSeason] = playersInCurrentSeason;
        savePlayersBySeason();
    }

    // Analiz bölümünü güncelle
    function updateAnalysis() {
        if (!analysisOutput) return;

        analysisOutput.innerHTML = '';

        if (!currentSeason || !playersBySeason[currentSeason] || playersBySeason[currentSeason].length === 0) {
            analysisOutput.innerHTML = '<p>Analiz için yeterli veri bulunmamaktadır (Seçili Sezon: ' + (currentSeason || 'Yok') + ').</p>';
            const analysisTablesContainer = document.querySelector('.analysis-tables-container');
            if (analysisTablesContainer) analysisTablesContainer.innerHTML = ''; // Tabloları temizle
            return;
        }

        const playersInCurrentSeason = playersBySeason[currentSeason];
        const stats = {};
        let totalPlayers = 0;
        let totalForeignPlayers = 0;
        let localCount = 0;
        let totalGoalsAllPlayers = 0;
        let totalAssistsAllPlayers = 0;
        let totalAvgRatingSum = 0;

        playersInCurrentSeason.forEach(player => {
            // NaN değerlerini 0'a çevirerek toplama hatalarını engelle
            const potential = typeof player.potential === 'number' ? player.potential : 0;
            const matches = typeof player.matches === 'number' ? player.matches : 0;
            const goals = typeof player.goals === 'number' ? player.goals : 0;
            const assists = typeof player.assists === 'number' ? player.assists : 0;
            const avgRating = typeof player.avgRating === 'number' ? player.avgRating : 0;

            if (!stats[player.position]) {
                stats[player.position] = {
                    count: 0, foreignCount: 0, totalPotential: 0, totalGoals: 0,
                    totalAssists: 0, totalMatches: 0, totalAvgRating: 0, players: []
                };
            }
            stats[player.position].count++;
            stats[player.position].totalPotential += potential;
            stats[player.position].totalGoals += goals;
            stats[player.position].totalAssists += assists;
            stats[player.position].totalMatches += matches;
            stats[player.position].totalAvgRating += avgRating;
            stats[player.position].players.push(player); // Player objesini olduğu gibi sakla

            if (player.isForeign) { stats[player.position].foreignCount++; totalForeignPlayers++; }
            else { localCount++; }
            totalPlayers++;
            totalGoalsAllPlayers += goals;
            totalAssistsAllPlayers += assists;
            totalAvgRatingSum += avgRating;
        });

        // Metinsel Analiz Çıktısı (Pozisyona göre oyuncu sayısı ve yabancı sayısı ile)
        let analysisHtml = '<h3>Pozisyonlara Göre Genel İstatistikler</h3>';
        analysisHtml += '<ul>';
        for (const pos of playerPositionsOrder) { // playerPositionsOrder'ı kullanarak sırayı koru
            if (stats[pos] && stats[pos].count > 0) { // Sadece toplam oyuncu sayısı 0'dan büyükse gözükmesini sağla
                const currentCount = stats[pos].count;
                const avgPotential = currentCount > 0 ? (stats[pos].totalPotential / currentCount) : 0;
                const avgRatingPos = currentCount > 0 ? (stats[pos].totalAvgRating / currentCount) : 0;
                const avgMatchesPos = currentCount > 0 ? (stats[pos].totalMatches / currentCount) : 0;
                
                analysisHtml += `<li><strong>${pos}:</strong> Toplam ${stats[pos].count} oyuncu (${stats[pos].foreignCount} yabancı). ` +
                                `Ort. Potansiyel: ${avgPotential.toFixed(1)}, Ort. Maç: ${avgMatchesPos.toFixed(1)}, ` +
                                `Toplam Gol: ${stats[pos].totalGoals}, Toplam Asist: ${stats[pos].totalAssists}, Ort. Puan: ${avgRatingPos.toFixed(2)}</li>`;
            } else if (stats[pos] && stats[pos].count === 0) {
                 // Eğer stat objesi varsa ama count 0 ise, bu pozisyonu gözükmesin (istediğiniz gibi)
            } else {
                 // Eğer pozisyon stat objesi yoksa da gözükmesin
            }
        }
        analysisHtml += '</ul>';
        analysisHtml += `<p><strong>Toplam Oyuncu Sayısı:</strong> ${totalPlayers} (${localCount} yerli, ${totalForeignPlayers} yabancı)</p>`;
        analysisHtml += `<p><strong>Takımdaki Toplam Gol:</strong> ${totalGoalsAllPlayers}</p>`;
        analysisHtml += `<p><strong>Takımdaki Toplam Asist:</strong> ${totalAssistsAllPlayers}</p>`;
        analysisHtml += `<p><strong>Takımdaki Ortalama Puan:</strong> ${(totalPlayers > 0 ? (totalAvgRatingSum / totalPlayers) : 0).toFixed(2)}</p>`;
        analysisOutput.innerHTML = analysisHtml;

        // ---- Yeni Analiz Tablolarını Oluştur ----
        const analysisTablesContainer = document.querySelector('.analysis-tables-container');
        if (analysisTablesContainer) {
            analysisTablesContainer.innerHTML = ''; // Önceki tabloları temizle
        } else {
            console.error("Analiz tabloları için konteyner bulunamadı: .analysis-tables-container");
            return;
        }

        // Yardımcı fonksiyon: Tablo oluştur ve doldur
        // formatFn: Değeri formatlamak için kullanılır. Eğer değer bir sayı değilse, boş string döndürecek.
        function createAndPopulateTable(tableId, title, headers, playersData, valueKey, formatFn = val => (typeof val === 'number' && !isNaN(val) ? val.toLocaleString() : '0')) {
            const tableBox = document.createElement('div');
            tableBox.className = 'analysis-table-box';
            
            const titleElement = document.createElement('h3');
            titleElement.textContent = title;
            tableBox.appendChild(titleElement);
            
            const tableElement = document.createElement('table');
            tableElement.id = tableId;
            const thead = tableElement.createTHead();
            const headerRow = thead.insertRow();
            headers.forEach(h => {
                const th = document.createElement('th');
                th.textContent = h;
                headerRow.appendChild(th);
            });
            tableBox.appendChild(tableElement);

            const tbody = tableElement.createTBody();
            
            // Tablo kutusunu gizleme mantığı: eğer playersData boşsa veya tüm sayısal değerleri 0 ise
            const hasMeaningfulData = playersData.some(player => {
                // Oyuncu Türüne Göre Sayı tablosu için
                if (tableId === 'playerTypeCountTable') {
                    return (typeof player.value === 'number' && !isNaN(player.value) && player.value !== 0);
                } 
                // Pozisyonlara Göre Oyuncu Sayısı için
                else if (tableId === 'playersByPositionCountTable') {
                    return (typeof player.totalCount === 'number' && !isNaN(player.totalCount) && player.totalCount !== 0);
                } 
                // Diğer Top N tabloları
                else { 
                    const value = player[valueKey];
                    return typeof value === 'number' && !isNaN(value) && value !== 0;
                }
            });

            if (playersData.length === 0 || !hasMeaningfulData) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = headers.length;
                cell.textContent = "Veri bulunmamaktadır.";
                tableBox.appendChild(tbody);
                analysisTablesContainer.appendChild(tableBox);
                tableBox.style.display = 'none'; // Veri yoksa veya hepsi sıfırsa kutuyu tamamen gizle
                return;
            } else {
                tableBox.style.display = 'block'; // Veri varsa göster
            }

            playersData.forEach(player => {
                const row = tbody.insertRow();
                
                // İlk sütun: Genellikle oyuncu adı, tür veya pozisyon
                const firstCell = row.insertCell();
                firstCell.textContent = player.name || player.type || player.position || ''; 
                
                // İkinci ve üçüncü sütunlar header'lara ve tablo ID'sine göre özel
                if (tableId === 'playerTypeCountTable') {
                    // Sayı sütunu
                    const valueCell = row.insertCell();
                    valueCell.textContent = formatFn(player.value);
                } else if (tableId === 'playersByPositionCountTable') {
                    // Pozisyonlara Göre Oyuncu Sayısı tablosu için: Pozisyon | Yabancı | Toplam
                    // headers: ['Pozisyon', 'Yabancı', 'Toplam']
                    const foreignCountCell = row.insertCell(); // Yabancı sayısı
                    foreignCountCell.textContent = typeof player.foreignCount === 'number' ? player.foreignCount.toLocaleString() : '0';

                    const totalCountCell = row.insertCell(); // Toplam sayısı
                    totalCountCell.textContent = typeof player.totalCount === 'number' ? player.totalCount.toLocaleString() : '0';
                } else {
                    // Diğer Top N tabloları için: Adı | Pozisyon | Değer
                    const posCell = row.insertCell();
                    posCell.textContent = player.position || ''; 

                    const valueCell = row.insertCell();
                    valueCell.textContent = formatFn(player[valueKey]);
                }
            });
            analysisTablesContainer.appendChild(tableBox); // Tablo kutusunu konteynere ekle
        }
        
        // Top N yardımcı fonksiyonu
        const getTopPlayers = (metric, count = 5) => {
            const filtered = playersInCurrentSeason.filter(p => typeof p[metric] === 'number' && !isNaN(p[metric]));
            
            if (filtered.length === 0) {
                return [];
            }
            return filtered.slice().sort((a, b) => b[metric] - a[metric]).slice(0, count);
        };

        // --- Tablo Verilerini Hazırla ve Oluştur ---

        // 1. Oyuncu Türüne Göre Sayı (Yerli/Yabancı)
        const playerTypeData = [
            { name: 'Yerli', value: localCount, type: 'Yerli' }, 
            { name: 'Yabancı', value: totalForeignPlayers, type: 'Yabancı' }
        ];
        createAndPopulateTable(
            'playerTypeCountTable', 
            'Pozisyonlara Göre Oyuncu Sayısı', 
            ['Oyuncu', 'Sayı'], 
            playerTypeData.map(item => ({ name: item.name, value: item.value, type: item.type })), 
            'value', 
            val => typeof val === 'number' ? val.toLocaleString() : '0'
        );

        // 2. Pozisyonlara Göre Oyuncu Sayısı (Yabancı Sayısı ile)
        const playersByPositionCount = [];
        playerPositionsOrder.forEach(pos => {
            if (stats[pos] && stats[pos].count > 0) { // Sadece toplam oyuncu sayısı 0'dan büyükse tabloya ekle
                playersByPositionCount.push({
                    position: pos, 
                    totalCount: stats[pos].count,
                    foreignCount: stats[pos].foreignCount
                });
            }
        });
        createAndPopulateTable(
            'playersByPositionCountTable',
            'Pozisyonlara Göre Oyuncu Sayısı',
            ['Pozisyon', 'Yabancı', 'Toplam'], 
            playersByPositionCount.map(item => ({ 
                position: item.position, 
                totalCount: item.totalCount, 
                foreignCount: item.foreignCount 
            })),
            'totalCount', 
            val => val // formatFn'e gerek kalmayacak, çünkü createAndPopulateTable içinde manuel formatlanacak
        );
        
        // 3. En İyi 5 Oyuncu (Ort. Puan) - Genel olarak
        createAndPopulateTable(
            'top5OverallRatingTable', 
            'En İyi 5 Oyuncu (Ort. Puan)', 
            ['Adı', 'Pozisyon', 'Ort. Puan'], 
            getTopPlayers('avgRating', 5), 
            'avgRating', 
            val => typeof val === 'number' ? val.toFixed(2) : String(val || '0')
        );

        // 4. En Çok Gol Atan 5 Oyuncu
        createAndPopulateTable(
            'topGoalScorersTable', 
            'En Çok Gol Atan 5 Oyuncu', 
            ['Adı', 'Pozisyon', 'Gol'], 
            getTopPlayers('goals', 5), 
            'goals', 
            val => typeof val === 'number' ? val.toLocaleString() : String(val || '0')
        );

        // 5. En Çok Asist Yapan 5 Oyuncu
        createAndPopulateTable(
            'topAssistersTable', 
            'En Çok Asist Yapan 5 Oyuncu', 
            ['Adı', 'Pozisyon', 'Asist'], 
            getTopPlayers('assists', 5), 
            'assists', 
            val => typeof val === 'number' ? val.toLocaleString() : String(val || '0')
        );

        // 6. En Yüksek Potansiyelli 5 Oyuncu
        createAndPopulateTable(
            'topPotentialPlayersTable', 
            'En Yüksek Potansiyelli 5 Oyuncu', 
            ['Adı', 'Pozisyon', 'Potansiyel'], 
            getTopPlayers('potential', 5), 
            'potential', 
            val => typeof val === 'number' ? val.toLocaleString() : String(val || '0')
        );
    }

    // destroyCharts fonksiyonu artık kullanılmıyor ve içi boş.

    if (importCsvBtn) importCsvBtn.addEventListener('click', handleCsvImport); if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportPlayersToCsv);

    function handleCsvImport() {
        if (!currentSeason) { alert("Lütfen önce bir sezon seçin veya yeni bir sezon ekleyin."); return; }
        if (!csvFileInput || !csvFileInput.files || csvFileInput.files.length === 0) { alert("Lütfen içe aktarılacak bir CSV dosyası seçin."); return; }
        const confirmReplace = confirm(`"${currentSeason}" sezonundaki TÜM mevcut oyuncular silinecek ve CSV dosyasındaki oyuncularla değiştirilecektir. Emin misiniz?`);
        if (!confirmReplace) { return; }
        const file = csvFileInput.files[0]; const reader = new FileReader(); reader.onload = function(e) { const text = e.target.result; processCsvPlayers(text); }; reader.readAsText(file, 'UTF-8');
    }

    function processCsvPlayers(csvText) {
        const lines = csvText.split('\n'); const headers = lines[0].split(';').map(h => h.trim());
        const expectedHeaders = ['Adı', 'Pozisyon', 'Potansiyel', 'Maç', 'Gol', 'Asist', 'Ort. Puan', 'Yabancı'];
        const areHeadersValid = expectedHeaders.every(header => headers.includes(header));
        if (!areHeadersValid) { alert("CSV dosyası geçersiz başlıklar içeriyor veya eksik sütunlar var. Beklenen başlıklar: " + expectedHeaders.join(", ")); return; }
        let addedCount = 0; let skippedCount = 0;
        playersBySeason[currentSeason] = []; // Mevcut oyuncuları sil
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim(); if (!line) continue; const values = line.split(';');
            const playerFromCsv = {
                id: Date.now() + i, // Yeni ID
                name: values[headers.indexOf('Adı')] ? values[headers.indexOf('Adı')].trim() : '',
                position: values[headers.indexOf('Pozisyon')] ? values[headers.indexOf('Pozisyon')].trim() : '',
                potential: parseInt(values[headers.indexOf('Potansiyel')] || '0'),
                matches: parseInt(values[headers.indexOf('Maç')] || '0'),
                goals: parseInt(values[headers.indexOf('Gol')] || '0'),
                assists: parseInt(values[headers.indexOf('Asist')] || '0'),
                avgRating: parseFloat(values[headers.indexOf('Ort. Puan')] || '0.0'),
                isForeign: (values[headers.indexOf('Yabancı')] || '').trim().toLowerCase() === 'evet'
            };
            if (!playerFromCsv.name || !playerFromCsv.position || isNaN(playerFromCsv.potential) || isNaN(playerFromCsv.matches) || isNaN(playerFromCsv.goals) || isNaN(playerFromCsv.assists) || isNaN(playerFromCsv.avgRating)) {
                console.warn(`Geçersiz veya eksik veri içeren satır atlandı: ${line}`); skippedCount++; continue;
            }
            if (playerFromCsv.potential < 0 || playerFromCsv.potential > 200) { console.warn(`Potansiyel aralığı dışındaki oyuncu atlandı: ${playerFromCsv.name} (Potansiyel: ${playerFromCsv.potential})`); skippedCount++; continue; }
            if (playerFromCsv.avgRating < 0 || playerFromCsv.avgRating > 10) { console.warn(`Ortalama Puan aralığı dışındaki oyuncu atlandı: ${playerFromCsv.name} (Ort. Puan: ${playerFromCsv.avgRating})`); skippedCount++; continue; }
            if (!playerPositionsOrder.includes(playerFromCsv.position) && playerFromCsv.position !== "Diğer") { console.warn(`Geçersiz pozisyona sahip oyuncu atlandı: ${playerFromCsv.name} (Pozisyon: ${playerFromCsv.position})`); skippedCount++; continue; }
            
            playersBySeason[currentSeason].push(playerFromCsv); addedCount++;
        }
        savePlayersBySeason();
        renderPlayers(); // Numaralandırma renderPlayers içinde
        updateAnalysis();
        alert(`${addedCount} oyuncu başarıyla içe aktarıldı. ${skippedCount} oyuncu atlandı.`); csvFileInput.value = '';
    }

    function exportPlayersToCsv() {
        if (!currentSeason || !playersBySeason[currentSeason] || playersBySeason[currentSeason].length === 0) { alert("Dışa aktarılacak oyuncu bulunmamaktadır."); return; }
        const playersToExport = playersBySeason[currentSeason];
        const headers = ["No", "Adı", "Pozisyon", "Potansiyel", "Maç", "Gol", "Asist", "Ort. Puan", "Yabancı"];
        const csvRows = []; csvRows.push(headers.join(';'));
        playersToExport.forEach(player => {
            const row = [
                player.no, player.name, player.position, player.potential,
                player.matches, player.goals, player.assists, player.avgRating.toFixed(2),
                player.isForeign ? 'Evet' : 'Hayır'
            ].map(item => `"${String(item).replace(/"/g, '""')}"`); csvRows.push(row.join(';'));
        });
        const csvString = csvRows.join('\n'); const blob = new Blob(["\ufeff", csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url;
        a.download = `${currentSeason}_futbolcular.csv`; document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        alert(`'${currentSeason}' sezonundaki oyuncular başarıyla CSV olarak dışa aktarıldı.`);
    }

    // Uygulama yüklendiğinde ilk yüklemeler ve günellemeler
    if (currentSeasonSelect && newSeasonInput && addSeasonBtn) { updateSeasonSelect(); } else { console.error("Sezon yönetim elementleri (currentSeasonSelect, newSeasonInput, addSeasonBtn) bulunamadı. Sezon yönetim işlevleri çalışmayabilir."); }
    if (Object.keys(playersBySeason).length === 0) {
        const currentYear = new Date().getFullYear(); const defaultSeason = `${currentYear}-${currentYear + 1}`;
        console.log("Hiç sezon bulunamadı, otomatik sezon oluşturuluyor:", defaultSeason);
        playersBySeason[defaultSeason] = []; currentSeason = defaultSeason; savePlayersBySeason();
        localStorage.setItem('currentFootballSeason', currentSeason); updateSeasonSelect();
        alert(`Uygulama ilk kez açıldığı için otomatik olarak '${defaultSeason}' sezonu oluşturuldu.`);
    } else if (Object.keys(playersBySeason).length > 0 && !currentSeason) {
        console.log("Sezonlar mevcut ama seçili sezon yok, en yeni sezon seçilecek."); updateSeasonSelect();
    } else if (currentSeason) { console.log("Uygulama mevcut sezon ile başlatıldı:", currentSeason); updateSeasonSelect(); }
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
