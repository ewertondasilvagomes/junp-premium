const API_KEY = 'AIzaSyBPOmXUtqcXATonhjw-pkWArcM4reU2gg';
let player;
let repeatedSections = [];
let chapters = [];
let consecutiveKeyPresses = 0;
let lastKeyPressTime = 0;

// Função para inicializar o YouTube Player
function onYouTubeIframeAPIReady() {
  document.getElementById('loadVideo').addEventListener('click', () => {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = extractVideoId(videoUrl);

    if (videoId) {
      loadVideo(videoId);
      fetchVideoData(videoId);
    } else {
      alert('Por favor, insira um link válido do YouTube.');
    }
  });
}

// Extrair ID do vídeo a partir do URL
function extractVideoId(url) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
}

// Carregar o vídeo no player
function loadVideo(videoId) {
  if (player) {
    player.destroy();
  }

  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: videoId,
    events: {
      'onStateChange': onPlayerStateChange,
    },
  });
}

// Buscar dados de repetição e capítulos
async function fetchVideoData(videoId) {
  // Substitua com a sua chamada da API do YouTube
  const response = await fetch(`/youtube-data?videoId=${videoId}`);
  const data = await response.json();

  repeatedSections = data.repeatedSections || [];
  chapters = data.chapters || [];
}

// Detectar teclas pressionadas
window.addEventListener('keydown', (event) => {
  const now = Date.now();
  if (event.key === 'ArrowRight') {
    if (now - lastKeyPressTime < 500) {
      consecutiveKeyPresses++;
    } else {
      consecutiveKeyPresses = 1;
    }
    lastKeyPressTime = now;

    if (consecutiveKeyPresses === 2) {
      document.getElementById('skipButton').style.display = 'block';
    }
  }
});

// Pular para a seção ou capítulo mais relevante
document.getElementById('skipButton').addEventListener('click', () => {
  const currentTime = player.getCurrentTime();
  const nextPoint = findNextPoint(currentTime);

  if (nextPoint !== null) {
    player.seekTo(nextPoint, true);
  }

  document.getElementById('skipButton').style.display = 'none';
});

// Encontrar o próximo ponto para pular
function findNextPoint(currentTime) {
  let nextTime = null;

  // Procurar a próxima seção mais repetida
  for (let section of repeatedSections) {
    if (section.start > currentTime) {
      nextTime = section.start;
      break;
    }
  }

  // Procurar o próximo capítulo se necessário
  if (!nextTime) {
    for (let chapter of chapters) {
      if (chapter.start > currentTime) {
        nextTime = chapter.start;
        break;
      }
    }
  }

  return nextTime;
}

// Manipular eventos de estado do player
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    document.getElementById('skipButton').style.display = 'none';
  }
}
