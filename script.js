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
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
  } catch (error) {
    console.error('URL inválida:', error);
    return null;
  }
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

// Buscar dados de repetição e capítulos usando a API do YouTube
async function fetchVideoData(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados do vídeo:', data);

    if (data.items.length > 0) {
      const videoInfo = data.items[0];
      const description = videoInfo.snippet.description;

      // Processar descrição para extrair capítulos
      chapters = parseChaptersFromDescription(description);

      // Simular seções mais repetidas (substitua com lógica real, se disponível)
      repeatedSections = simulateRepeatedSections();
    } else {
      console.error('Nenhum dado encontrado para o vídeo.');
    }
  } catch (error) {
    console.error('Erro ao buscar dados do vídeo:', error);
  }
}

// Simular seções mais repetidas (substituir pela lógica real)
function simulateRepeatedSections() {
  return [
    { start: 30, end: 60 }, // Exemplo: seção mais repetida
  ];
}

// Detectar capítulos a partir da descrição do vídeo
function parseChaptersFromDescription(description) {
  const regex = /(\d{1,2}:\d{2})\s+-\s+(.*)/g;
  const matches = [];
  let match;

  while ((match = regex.exec(description)) !== null) {
    const timeParts = match[1].split(':');
    const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);

    matches.push({ start: seconds, title: match[2] });
  }

  return matches;
}
// dectando o iframe 

const iframe = document.querySelector("#player").innerHTML;
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
  if (!player || !player.getCurrentTime) return;

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


// Carregar a API do YouTube
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

document.addEventListener('keydown', (event) => {
  // Verifica se a tecla pressionada é a seta para a direita
  if (event.key === 'ArrowRight') {
    // Aqui você coloca o código que deseja executar
    console.log('Você pressionou a seta para a direita!');
    // Exemplo: mover um elemento para a direita
    document.getElementById('divframe').style.left = '+=10px';
  }
});