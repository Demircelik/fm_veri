document.addEventListener('DOMContentLoaded', () => {
    // overallSummaryList referansı kaldırıldı, çünkü HTML'den kaldırıldı
    // const overallSummaryList = document.getElementById('overallSummaryList'); 

    const seasonTotalGoalsTableBody = document.querySelector('#seasonTotalGoalsTable tbody');
    const seasonTotalAssistsTableBody = document.querySelector('#seasonTotalAssistsTable tbody'); 
    const seasonAvgRatingTableBody = document.querySelector('#seasonAvgRatingTable tbody'); 
    const seasonTopScorersTableBody = document.querySelector('#seasonTopScorersTable tbody');
    const seasonTopAssistersTableBody = document.querySelector('#seasonTopAssistersTable tbody');
    const seasonTopRatedTableBody = document.querySelector('#seasonTopRatedTable tbody');
    const seasonTopPotentialTableBody = document.querySelector('#seasonTopPotentialTable tbody');

    let playersBySeason = loadPlayersBySeason(); 

    // localStorage'dan sezon verilerini yükleyen fonksiyon
    function loadPlayersBySeason() {
        try {
            const storedData = localStorage.getItem('footballPlayersBySeason');
            return storedData ? JSON.parse(storedData) : {};
        } catch (e) {
            console.error("Local Storage'dan sezon verileri yüklenirken hata:", e);
            return {};
        }
    }

    // Tabloyu dolduran yardımcı fonksiyon
    // isSimpleTable: Eğer sadece sezon ve bir değer sütunu varsa true (örn: Toplam Gol, Toplam Asist, Ort. Puan)
    function populateOverallStatsTable(tbody, data, valueKey, formatFn = val => (typeof val === 'number' ? val.toLocaleString() : '0'), isSimpleTable = false) {
        tbody.innerHTML = '';
        if (!data || data.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = isSimpleTable ? 2 : 3; // Basit tablolar (Sezon, Değer) 2 sütunlu, diğerleri 3
            cell.textContent = "Veri bulunmamaktadır.";
            return;
        }

        data.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell().textContent = item.season || ''; // Sezon

            if (isSimpleTable) { // Sadece Sezon ve bir değer sütunu varsa
                row.insertCell().textContent = formatFn(item.value); // 'value' anahtarını kullan
            } else { // Diğer 3 sütunlu tablolar (Sezon, Oyuncu, Değer)
                row.insertCell().textContent = item.playerName || ''; // Oyuncu Adı
                row.insertCell().textContent = formatFn(item[valueKey]); // Değer (Gol Sayısı, Asist Sayısı, Ort. Puan, Potansiyel)
            }
        });
    }

    // Tüm sezonların istatistiklerini hesapla ve göster
    function loadOverallStats() {
        const seasonTotalGoalsList = [];
        const seasonTotalAssistsList = [];
        const seasonAvgRatingList = [];
        const seasonTopScorers = [];
        const seasonTopAssisters = [];
        const seasonTopRated = [];
        const seasonTopPotential = [];

        for (const season in playersBySeason) {
            const seasonPlayers = playersBySeason.hasOwnProperty(season) ? playersBySeason[season] : [];
            
            let currentSeasonTotalGoals = 0; 
            let currentSeasonTotalAssists = 0; 
            let currentSeasonTotalRatingSum = 0; 
            let currentSeasonPlayerCountWithRating = 0; 

            if (seasonPlayers && seasonPlayers.length > 0) {
                currentSeasonTotalGoals = seasonPlayers.reduce((sum, player) => sum + (typeof player.goals === 'number' ? player.goals : 0), 0);
                seasonTotalGoalsList.push({ season: season, value: currentSeasonTotalGoals }); 

                currentSeasonTotalAssists = seasonPlayers.reduce((sum, player) => sum + (typeof player.assists === 'number' ? player.assists : 0), 0);
                seasonTotalAssistsList.push({ season: season, value: currentSeasonTotalAssists }); 

                seasonPlayers.forEach(player => {
                    if (typeof player.avgRating === 'number' && !isNaN(player.avgRating)) {
                        currentSeasonTotalRatingSum += player.avgRating;
                        currentSeasonPlayerCountWithRating++;
                    }
                });
                const currentSeasonAvgRating = currentSeasonPlayerCountWithRating > 0 ? currentSeasonTotalRatingSum / currentSeasonPlayerCountWithRating : 0;
                seasonAvgRatingList.push({ season: season, value: currentSeasonAvgRating }); 

                const topGoalScorer = seasonPlayers.filter(p => typeof p.goals === 'number' && !isNaN(p.goals)).sort((a, b) => b.goals - a.goals)[0];
                const topAssister = seasonPlayers.filter(p => typeof p.assists === 'number' && !isNaN(p.assists)).sort((a, b) => b.assists - a.assists)[0];
                const topRated = seasonPlayers.filter(p => typeof p.avgRating === 'number' && !isNaN(p.avgRating)).sort((a, b) => b.avgRating - a.avgRating)[0];
                const topPotential = seasonPlayers.filter(p => typeof p.potential === 'number' && !isNaN(p.potential)).sort((a, b) => b.potential - a.potential)[0];

                 if (topGoalScorer) seasonTopScorers.push({ season: season, playerName: topGoalScorer.name, goalCount: topGoalScorer.goals });
                if (topAssister) seasonTopAssisters.push({ season: season, playerName: topAssister.name, assistCount: topAssister.assists });
                if (topRated) seasonTopRated.push({ season: season, playerName: topRated.name, avgRating: topRated.avgRating });
                if (topPotential) seasonTopPotential.push({ season: season, playerName: topPotential.name, potential: topPotential.potential });
            }
        }

        // Detaylı sezon bazında tabloları doldur
        populateOverallStatsTable(seasonTotalGoalsTableBody, seasonTotalGoalsList, 'value', undefined, true); // isSimpleTable = true
        populateOverallStatsTable(seasonTotalAssistsTableBody, seasonTotalAssistsList, 'value', undefined, true); // isSimpleTable = true
        populateOverallStatsTable(seasonAvgRatingTableBody, seasonAvgRatingList, 'value', val => val.toFixed(2), true); // isSimpleTable = true

        populateOverallStatsTable(seasonTopScorersTableBody, seasonTopScorers, 'goalCount');
        populateOverallStatsTable(seasonTopAssistersTableBody, seasonTopAssisters, 'assistCount');
        populateOverallStatsTable(seasonTopRatedTableBody, seasonTopRated, 'avgRating', val => val.toFixed(2));
        populateOverallStatsTable(seasonTopPotentialTableBody, seasonTopPotential, 'potential');
    }

    loadOverallStats(); // Sayfa yüklendiğinde genel istatistikleri yükle
});
