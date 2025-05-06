const randomAvatar = () => {
  const avatars = [
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0000_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0001_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0002_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0003_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0004_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0005_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0006_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0007_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0008_f00_s0.png",
    "https://resource.pokemon-home.com/battledata/img/pokei128/icon0009_f00_s0.png",
  ];

  const randomIndex = Math.floor(Math.random() * avatars.length);
  return avatars[randomIndex];
};

module.exports = randomAvatar;
