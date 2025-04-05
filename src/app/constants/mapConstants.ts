// Default center coordinates (Tokyo, Japan)
export const DEFAULT_CENTER = {
  lat: 35.6762,
  lng: 139.6503
};

// Map options
export const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true
};

// Major Intercity Shinkansen Lines connecting major cities
export const JAPAN_INTERCITY_LINES = [
  {
    name: "Tokaido Shinkansen",
    color: "#0072BC", // Blue
    description: "Tokyo to Osaka",
    stations: [
      { name: "Tokyo", position: { lat: 35.6812362, lng: 139.7649361 } },
      { name: "Shinagawa", position: { lat: 35.6284713, lng: 139.7387787 } },
      { name: "Shin-Yokohama", position: { lat: 35.5075428, lng: 139.6166769 } },
      { name: "Odawara", position: { lat: 35.2564369, lng: 139.1549223 } },
      { name: "Atami", position: { lat: 35.0950666, lng: 139.0753693 } },
      { name: "Mishima", position: { lat: 35.1218833, lng: 138.9123731 } },
      { name: "Shin-Fuji", position: { lat: 35.1420136, lng: 138.6632214 } },
      { name: "Shizuoka", position: { lat: 34.9719986, lng: 138.4101275 } },
      { name: "Kakegawa", position: { lat: 34.7692366, lng: 138.0005077 } },
      { name: "Hamamatsu", position: { lat: 34.7040471, lng: 137.7287234 } },
      { name: "Toyohashi", position: { lat: 34.7692433, lng: 137.3914993 } },
      { name: "Mikawa-Anjo", position: { lat: 34.956581, lng: 137.0800148 } },
      { name: "Nagoya", position: { lat: 35.1709456, lng: 136.8815428 } },
      { name: "Gifu-Hashima", position: { lat: 35.3169363, lng: 136.6857747 } },
      { name: "Maibara", position: { lat: 35.3137546, lng: 136.290763 } },
      { name: "Kyoto", position: { lat: 34.9858126, lng: 135.7586962 } },
      { name: "Shin-Osaka", position: { lat: 34.7336551, lng: 135.5004553 } }
    ]
  },
  {
    name: "Sanyo Shinkansen",
    color: "#009250", // Green
    description: "Osaka to Fukuoka",
    stations: [
      { name: "Shin-Osaka", position: { lat: 34.7336551, lng: 135.5004553 } },
      { name: "Shin-Kobe", position: { lat: 34.6912754, lng: 135.197438 } },
      { name: "Nishi-Akashi", position: { lat: 34.6690273, lng: 134.9692993 } },
      { name: "Himeji", position: { lat: 34.8330939, lng: 134.6897252 } },
      { name: "Okayama", position: { lat: 34.6662659, lng: 133.9154937 } },
      { name: "Shin-Kurashiki", position: { lat: 34.5855256, lng: 133.7679601 } },
      { name: "Fukuyama", position: { lat: 34.5012604, lng: 133.3614783 } },
      { name: "Shin-Onomichi", position: { lat: 34.4295111, lng: 133.1958359 } },
      { name: "Mihara", position: { lat: 34.4027039, lng: 133.0801682 } },
      { name: "Higashi-Hiroshima", position: { lat: 34.3963276, lng: 132.7363525 } },
      { name: "Hiroshima", position: { lat: 34.3973853, lng: 132.4599466 } },
      { name: "Shin-Iwakuni", position: { lat: 34.1680398, lng: 132.1548838 } },
      { name: "Tokuyama", position: { lat: 34.0502192, lng: 131.8033295 } },
      { name: "Shin-Yamaguchi", position: { lat: 34.0980835, lng: 131.3960195 } },
      { name: "Kokura", position: { lat: 33.8866736, lng: 130.8830347 } },
      { name: "Hakata", position: { lat: 33.5901879, lng: 130.4206434 } }
    ]
  },
  {
    name: "Tohoku Shinkansen",
    color: "#E54C84", // Magenta
    description: "Tokyo to Aomori",
    stations: [
      { name: "Tokyo", position: { lat: 35.6812362, lng: 139.7649361 } },
      { name: "Ueno", position: { lat: 35.7141311, lng: 139.7774482 } },
      { name: "Omiya", position: { lat: 35.9059549, lng: 139.6238938 } },
      { name: "Utsunomiya", position: { lat: 36.5592232, lng: 139.8981128 } },
      { name: "Nasushiobara", position: { lat: 36.9389386, lng: 140.0470536 } },
      { name: "Koriyama", position: { lat: 37.4107627, lng: 140.3873254 } },
      { name: "Fukushima", position: { lat: 37.7604844, lng: 140.4748498 } },
      { name: "Sendai", position: { lat: 38.2600929, lng: 140.8797396 } },
      { name: "Morioka", position: { lat: 39.7015182, lng: 141.1369885 } },
      { name: "Shin-Aomori", position: { lat: 40.822309, lng: 140.6884241 } }
    ]
  },
  {
    name: "Hokuriku Shinkansen",
    color: "#6F4F9E", // Purple
    description: "Tokyo to Kanazawa",
    stations: [
      { name: "Tokyo", position: { lat: 35.6812362, lng: 139.7649361 } },
      { name: "Omiya", position: { lat: 35.9059549, lng: 139.6238938 } },
      { name: "Takasaki", position: { lat: 36.3211862, lng: 139.0035035 } },
      { name: "Nagano", position: { lat: 36.6434706, lng: 138.1888351 } },
      { name: "Toyama", position: { lat: 36.7045612, lng: 137.2142699 } },
      { name: "Kanazawa", position: { lat: 36.5784964, lng: 136.6486436 } }
    ]
  },
  {
    name: "Kyushu Shinkansen",
    color: "#F08300", // Orange
    description: "Fukuoka to Kagoshima",
    stations: [
      { name: "Hakata", position: { lat: 33.5901879, lng: 130.4206434 } },
      { name: "Kurume", position: { lat: 33.316069, lng: 130.5091183 } },
      { name: "Chikugo-Funagoya", position: { lat: 33.1405029, lng: 130.5542622 } },
      { name: "Shin-Tosu", position: { lat: 33.3775008, lng: 130.5066433 } },
      { name: "Kumamoto", position: { lat: 32.7904522, lng: 130.7414464 } },
      { name: "Shin-Yatsushiro", position: { lat: 32.4988241, lng: 130.6092702 } },
      { name: "Shin-Minamata", position: { lat: 32.1963663, lng: 130.3969378 } },
      { name: "Izumi", position: { lat: 32.0901436, lng: 130.3525804 } },
      { name: "Sendai (Kagoshima)", position: { lat: 31.8066339, lng: 130.3007574 } },
      { name: "Kagoshima-Chuo", position: { lat: 31.5802581, lng: 130.5418508 } }
    ]
  }
];

// Tokyo Train Lines data (simplified major lines)
export const TOKYO_TRAIN_LINES = [
  {
    name: "Yamanote Line",
    color: "#9ACD32", // Green
    stations: [
      { name: "Tokyo Station", position: { lat: 35.6812362, lng: 139.7649361 } },
      { name: "Yurakucho", position: { lat: 35.6749192, lng: 139.7628384 } },
      { name: "Shimbashi", position: { lat: 35.6661933, lng: 139.7583319 } },
      { name: "Hamamatsucho", position: { lat: 35.6553187, lng: 139.7574108 } },
      { name: "Tamachi", position: { lat: 35.6457361, lng: 139.7476669 } },
      { name: "Shinagawa", position: { lat: 35.6284713, lng: 139.7387787 } },
      { name: "Osaki", position: { lat: 35.6197176, lng: 139.7282985 } },
      { name: "Gotanda", position: { lat: 35.6261511, lng: 139.7233704 } },
      { name: "Meguro", position: { lat: 35.6339914, lng: 139.7159333 } },
      { name: "Ebisu", position: { lat: 35.6465876, lng: 139.7101609 } },
      { name: "Shibuya", position: { lat: 35.6580339, lng: 139.7016358 } },
      { name: "Harajuku", position: { lat: 35.6702285, lng: 139.7026975 } },
      { name: "Yoyogi", position: { lat: 35.6835186, lng: 139.7023853 } },
      { name: "Shinjuku", position: { lat: 35.6896067, lng: 139.7005713 } },
      { name: "Shin-Okubo", position: { lat: 35.7013585, lng: 139.699399 } },
      { name: "Takadanobaba", position: { lat: 35.7121683, lng: 139.703786 } },
      { name: "Mejiro", position: { lat: 35.7208365, lng: 139.7068501 } },
      { name: "Ikebukuro", position: { lat: 35.7295087, lng: 139.7109316 } },
      { name: "Otsuka", position: { lat: 35.7323627, lng: 139.7286419 } },
      { name: "Sugamo", position: { lat: 35.7334734, lng: 139.7394862 } },
      { name: "Komagome", position: { lat: 35.7365618, lng: 139.7467757 } },
      { name: "Tabata", position: { lat: 35.738062, lng: 139.7608953 } },
      { name: "Nishi-Nippori", position: { lat: 35.7324032, lng: 139.7669865 } },
      { name: "Nippori", position: { lat: 35.7280426, lng: 139.7706546 } },
      { name: "Uguisudani", position: { lat: 35.7219525, lng: 139.7784688 } },
      { name: "Ueno", position: { lat: 35.7141311, lng: 139.7774482 } },
      { name: "Okachimachi", position: { lat: 35.7075932, lng: 139.7743181 } },
      { name: "Akihabara", position: { lat: 35.6983573, lng: 139.7731188 } },
      { name: "Kanda", position: { lat: 35.691796, lng: 139.770883 } }
    ]
  },
  {
    name: "Chuo Line",
    color: "#FF4500", // Orange-Red
    stations: [
      { name: "Tokyo Station", position: { lat: 35.6812362, lng: 139.7649361 } },
      { name: "Kanda", position: { lat: 35.691796, lng: 139.770883 } },
      { name: "Ochanomizu", position: { lat: 35.6993854, lng: 139.7652417 } },
      { name: "Suidobashi", position: { lat: 35.7016393, lng: 139.7537889 } },
      { name: "Iidabashi", position: { lat: 35.7019041, lng: 139.7448527 } },
      { name: "Ichigaya", position: { lat: 35.6945656, lng: 139.7364759 } },
      { name: "Yotsuya", position: { lat: 35.686034, lng: 139.7312731 } },
      { name: "Shinjuku", position: { lat: 35.6896067, lng: 139.7005713 } }
    ]
  },
  {
    name: "Ginza Line",
    color: "#FF9500", // Orange
    stations: [
      { name: "Shibuya", position: { lat: 35.6580339, lng: 139.7016358 } },
      { name: "Omotesando", position: { lat: 35.6659867, lng: 139.7126907 } },
      { name: "Gaienmae", position: { lat: 35.670399, lng: 139.7178192 } },
      { name: "Aoyama-Itchome", position: { lat: 35.6728706, lng: 139.7236634 } },
      { name: "Akasaka-Mitsuke", position: { lat: 35.6766708, lng: 139.7375322 } },
      { name: "Ginza", position: { lat: 35.6712074, lng: 139.7636591 } },
      { name: "Ueno", position: { lat: 35.7141311, lng: 139.7774482 } }
    ]
  },
  {
    name: "Marunouchi Line",
    color: "#E60012", // Red
    stations: [
      { name: "Ikebukuro", position: { lat: 35.7295087, lng: 139.7109316 } },
      { name: "Shin-Otsuka", position: { lat: 35.7261359, lng: 139.7291777 } },
      { name: "Myogadani", position: { lat: 35.7173403, lng: 139.7376411 } },
      { name: "Korakuen", position: { lat: 35.7074075, lng: 139.7511747 } },
      { name: "Hongo-Sanchome", position: { lat: 35.7068724, lng: 139.7595161 } },
      { name: "Tokyo Station", position: { lat: 35.6812362, lng: 139.7649361 } },
      { name: "Ginza", position: { lat: 35.6712074, lng: 139.7636591 } },
      { name: "Shinjuku", position: { lat: 35.6896067, lng: 139.7005713 } }
    ]
  },
  {
    name: "Hibiya Line",
    color: "#B5B5AC", // Silver
    stations: [
      { name: "Ebisu", position: { lat: 35.6465876, lng: 139.7101609 } },
      { name: "Hiro-o", position: { lat: 35.6507396, lng: 139.7222827 } },
      { name: "Roppongi", position: { lat: 35.6641222, lng: 139.729426 } },
      { name: "Kamiyacho", position: { lat: 35.6628454, lng: 139.7452132 } },
      { name: "Kasumigaseki", position: { lat: 35.6732036, lng: 139.7501247 } },
      { name: "Hibiya", position: { lat: 35.6745771, lng: 139.7598203 } },
      { name: "Ginza", position: { lat: 35.6712074, lng: 139.7636591 } },
      { name: "Higashi-Ginza", position: { lat: 35.6697003, lng: 139.7671399 } },
      { name: "Tsukiji", position: { lat: 35.6679758, lng: 139.772644 } },
      { name: "Hatchobori", position: { lat: 35.6751238, lng: 139.7779836 } },
      { name: "Ueno", position: { lat: 35.7141311, lng: 139.7774482 } }
    ]
  }
];

// Osaka Metro Lines
export const OSAKA_TRAIN_LINES = [
  {
    name: "Midosuji Line",
    color: "#E5171F", // Red
    stations: [
      { name: "Esaka", position: { lat: 34.7582284, lng: 135.4948922 } },
      { name: "Shin-Osaka", position: { lat: 34.7336551, lng: 135.5004553 } },
      { name: "Nishinakajima-Minamigata", position: { lat: 34.7254075, lng: 135.4982095 } },
      { name: "Higashi-Mikuni", position: { lat: 34.7148539, lng: 135.4960249 } },
      { name: "Shin-Midosuji", position: { lat: 34.704882, lng: 135.4976343 } },
      { name: "Yodoyabashi", position: { lat: 34.6926981, lng: 135.5016447 } },
      { name: "Umeda", position: { lat: 34.7036581, lng: 135.499663 } },
      { name: "Namba", position: { lat: 34.668519, lng: 135.5022535 } },
      { name: "Tennoji", position: { lat: 34.6479369, lng: 135.5143744 } }
    ]
  },
  {
    name: "JR Loop Line",
    color: "#F68B1E", // Orange
    stations: [
      { name: "Osaka Station", position: { lat: 34.7024853, lng: 135.4937619 } },
      { name: "Shin-Osaka", position: { lat: 34.7336551, lng: 135.5004553 } },
      { name: "Tennoji", position: { lat: 34.6479369, lng: 135.5143744 } },
      { name: "Nishikujo", position: { lat: 34.681594, lng: 135.4661942 } },
      { name: "Bentencho", position: { lat: 34.6770191, lng: 135.4599252 } },
      { name: "Noda", position: { lat: 34.6812362, lng: 135.4649361 } }
    ]
  }
];

// Kyoto Train Lines
export const KYOTO_TRAIN_LINES = [
  {
    name: "Karasuma Line",
    color: "#007AC0", // Blue
    stations: [
      { name: "Kokusaikaikan", position: { lat: 35.0454854, lng: 135.7841015 } },
      { name: "Kyoto Station", position: { lat: 34.9858126, lng: 135.7586962 } },
      { name: "Karasuma Oike", position: { lat: 35.0114274, lng: 135.7588134 } },
      { name: "Kitaoji", position: { lat: 35.0429383, lng: 135.7546001 } }
    ]
  },
  {
    name: "Tozai Line",
    color: "#FFA500", // Orange
    stations: [
      { name: "Uzumasa Tenjingawa", position: { lat: 35.0097985, lng: 135.7140553 } },
      { name: "Karasuma Oike", position: { lat: 35.0114274, lng: 135.7588134 } },
      { name: "Sanjo Keihan", position: { lat: 35.0095282, lng: 135.7720851 } },
      { name: "Rokujizo", position: { lat: 34.9362574, lng: 135.7996881 } }
    ]
  }
];

// Nagoya Train Lines
export const NAGOYA_TRAIN_LINES = [
  {
    name: "Higashiyama Line",
    color: "#F8B500", // Yellow
    stations: [
      { name: "Nagoya Station", position: { lat: 35.1709456, lng: 136.8815428 } },
      { name: "Sakae", position: { lat: 35.1691887, lng: 136.9090596 } },
      { name: "Higashiyama Koen", position: { lat: 35.1566467, lng: 136.9755787 } },
      { name: "Fujigaoka", position: { lat: 35.1900023, lng: 137.0443258 } }
    ]
  },
  {
    name: "Meijo Line",
    color: "#CC007A", // Purple
    stations: [
      { name: "Nagoya Station", position: { lat: 35.1709456, lng: 136.8815428 } },
      { name: "Sakae", position: { lat: 35.1691887, lng: 136.9090596 } },
      { name: "Kanayama", position: { lat: 35.1418736, lng: 136.9016201 } },
      { name: "Aratama-bashi", position: { lat: 35.1275307, lng: 136.9137566 } }
    ]
  }
]; 