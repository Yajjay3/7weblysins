// ============================================================
// 7 DEADLY SINS CHROME EXTENSION — Content Script
// Scans each page and shows a tailored sin warning or
// a positive encouragement message.
// ============================================================

const SINS = {
  pride: {
    emoji: '👑',
    name: 'Pride',
    color: '#e1bee7',
  },
  greed: {
    emoji: '💰',
    name: 'Greed',
    color: '#fff176',
  },
  lust: {
    emoji: '🔥',
    name: 'Lust',
    color: '#ef9a9a',
  },
  envy: {
    emoji: '💚',
    name: 'Envy',
    color: '#a5d6a7',
  },
  gluttony: {
    emoji: '🍔',
    name: 'Gluttony',
    color: '#ffcc80',
  },
  wrath: {
    emoji: '😡',
    name: 'Wrath',
    color: '#e57373',
  },
  sloth: {
    emoji: '🦥',
    name: 'Sloth',
    color: '#90caf9',
  },
};

// ============================================================
// SITE DETECTION RULES
// Each rule: keywords to match in URL or page content,
// which sin it maps to, and friendly messages to show.
// ============================================================

const SITE_RULES = [
  // --- SHOPPING → GREED ---
  {
    sin: 'greed',
    urlPatterns: ['amazon', 'ebay', 'walmart', 'target', 'bestbuy', 'etsy', 'shopify', 'aliexpress', 'wish.com', 'macys', 'nordstrom', 'zappos', 'shein', 'temu', 'costco', 'wayfair', 'overstock', 'newegg', 'sephora', 'ulta.com', 'zara.com', 'hm.com', 'asos.com', 'forever21', 'fashionnova', 'gap.com', 'oldnavy.com', 'jcrew.com', 'kohls.com', 'tjmaxx.com', 'marshalls.com', 'gamestop.com', 'stockx.com', 'goat.com', 'poshmark.com', 'mercari.com', 'offerup.com', 'craigslist.org', 'ikea.com', 'bathandbodyworks', 'victoriassecret', 'adidas.com', 'underarmour.com', 'lululemon.com', 'anthropologie.com', 'urbanoutfitters.com', 'freepeople.com', 'dickssportinggoods.com', 'cabelas.com', 'basspro.com', 'rei.com', 'slickdeals.net', 'joinhoney.com', 'louisvuitton.com', 'gucci.com', 'rolex.com', 'prada.com', 'chanel.com', 'hermes.com', 'burberry.com', 'cartier.com', 'tiffany.com', 'groupon.com', 'retailmenot.com', 'coupons.com', 'woot.com', 'coinbase.com', 'binance.com', 'crypto.com', 'kraken.com'],
    pageKeywords: ['clothing', 'apparel', 'toy store', 'gift shop', 'boutique', 'jewelry', 'jewellery', 'necklace', 'bracelet', 'earrings', 'shoe store', 'sporting goods', 'furniture', 'designer bag', 'designer bags', 'luxury watch', 'watch store', 'watches', 'sunglasses', 'pawn shop', 'casino', 'jackpot', 'law firm', 'law office', 'attorney', 'lawyer', 'legal services', 'personal injury', 'free consultation'],
    messages: [
      "This looks like a fun store with lots of cool stuff. But make sure you do not fall into Greed and buy a bunch of things you really do not need!",
      "Shopping can be fun, but remember — practice Temperance and Self-Control. Only buy what you truly need!",
      "Before you click 'Buy Now,' ask yourself: do I really need this, or is Greed talking? Be Intentional with your spending!",
      "A wise person knows the difference between wants and needs. Practice Restraint and shop thoughtfully!",
      "Charity is the opposite of Greed. Instead of buying more for yourself, consider giving to someone in need!",
      "Balance is key. It's okay to treat yourself sometimes, but Mindfulness will keep Greed in check.",
      "Clickety-click, add to cart real quick — but a penny saved is a penny earned, friend!",
      "Roses are red, your wallet is blue, do you really need this, or is Greed fooling you?",
      "Here's a riddle: What gets emptier the more you fill it? A shopping cart driven by Greed!",
      "As the old folks say: 'A fool and his money are soon parted.' Be wise, not wasteful!",
      "Money talks, but what's yours saying? 'Help, I'm disappearing!' Practice a little Restraint today.",
      "If your cart's overflowing but your heart's still wanting — that's Greed whispering. Shh, don't listen!",
      "Old proverb: 'He who buys what he does not need, steals from himself.' Think it over!",
    ],
  },

  // --- FOOD / RESTAURANTS → GLUTTONY ---
  {
    sin: 'gluttony',
    urlPatterns: ['doordash', 'ubereats', 'grubhub', 'postmates', 'seamless', 'yelp.com/biz', 'opentable', 'allrecipes', 'foodnetwork', 'epicurious', 'tastykitchen', 'dominos', 'pizzahut', 'mcdonalds', 'chipotle', 'instacart', 'safeway', 'luckysupermarkets', 'kroger', 'albertsons', 'traderjoes', 'wholefoods', 'sprouts', 'publix', 'wegmans', 'heb.com', 'aldi', 'foodlion', 'stopandshop', 'giantfood', 'winndixie', 'freshdirect', 'peapod', 'starbucks.com', 'dunkindonuts.com', 'panerabread.com', 'papajohns.com', 'burgerking.com', 'wendys.com', 'tacobell.com', 'chick-fil-a.com', 'kfc.com', 'popeyes.com', 'subway.com', 'pandaexpress.com', 'olivegarden.com', 'applebees.com', 'chilis.com', 'ihop.com', 'dennys.com', 'gopuff.com', 'slicelife.com', 'hellofresh.com', 'blueapron.com', 'cheesecakefactory.com', 'outback.com', 'redlobster.com', 'crackerbarrel.com', 'wingstop.com', 'jimmyjohns.com', 'fiveguys.com', 'shakeshack.com', 'jackinthebox.com', 'whataburger.com', 'culvers.com', 'raisingcanes.com', 'zaxbys.com', 'tasty.co', 'delish.com', 'bonappetit.com', 'yummly.com', 'sees.com', 'nuts.com', 'carvel.com', 'baskinrobbins.com', 'coldstonecreamery.com', 'dairyqueen.com', 'crumblcookies.com', 'insomniacookies.com', 'nothingbundtcakes.com', 'mrsfields.com', 'ediblearrangements.com', 'candywarehouse.com', 'sugarfina.com'],
    pageKeywords: ['menu', 'delivery', 'appetizer', 'entree', 'dessert', 'desserts', 'restaurant', 'order food', 'bbq', 'barbecue', 'barbeque', 'ice cream', 'gelato', 'frozen yogurt', 'sweet treats', 'treats', 'candy store', 'candy shop', 'candy', 'chocolate', 'cupcake', 'cupcakes', 'cake', 'cakes', 'pie', 'pies', 'cookie', 'cookies', 'brownie', 'brownies', 'bakery', 'pastry', 'pastries', 'donut', 'donuts', 'nuts', 'sweet shop'],
    messages: [
      "This looks like a fun place to eat! But remember, do not be gluttonous and eat more than you need to!",
      "Food is a wonderful gift — enjoy it, but remember that Temperance is the virtue that keeps Gluttony in check.",
      "Ordering food? Great! Just practice Moderation — make sure you're eating to live, not living to eat.",
      "A good meal is a blessing. Just be Mindful not to overdo it — your body is a temple!",
      "Self-Control at the table is a quiet but powerful virtue. Enjoy your meal, but know when enough is enough!",
      "Practice Intentionality with your food choices. Nourish your body, don't just feed your cravings!",
      "Snack attack! Before you stack that order high, ask your tummy — not your eyes — if you're really hungry.",
      "Roses are red, pizza is great, but ordering too much food is a Gluttonous trait!",
      "Riddle me this: What starts as 'just one more bite' and ends with unbuttoned pants? Gluttony!",
      "Grandma always said: 'Your eyes are bigger than your stomach.' She wasn't wrong!",
      "One for the tummy, two for the soul — but five extra sides? That's losing control!",
      "Ancient wisdom: 'Eat to live, don't live to eat.' Your future self will thank you!",
      "Here's a little food for thought: you can always order more later, but you can't un-eat a feast!",
    ],
  },

  // --- SOCIAL MEDIA → ENVY ---
  {
    sin: 'envy',
    urlPatterns: ['facebook.com', 'instagram.com', 'tiktok.com', 'snapchat.com', 'pinterest.com', 'threads.net', 'bsky.app', 'bereal.com', 'lemon8-app.com', 'tumblr.com', 'zillow.com', 'expedia.com', 'booking.com', 'airbnb.com', 'tripadvisor.com', 'lonelyplanet.com', 'atlasobscura.com', 'theknot.com', 'zola.com', 'weddingwire.com', 'houzz.com'],
    pageKeywords: ['perfume', 'cologne', 'fragrance', 'nail salon', 'hair salon'],
    messages: [
      "Social media can be fun, but be careful not to fall into Envy. Remember, people only post their highlight reels — not their real lives!",
      "Scrolling through other people's lives? Practice Kindness instead of Envy. You have your own blessings to be grateful for!",
      "You've been here for a bit. Practice Awareness — comparing yourself to others is the thief of joy!",
      "Everyone's journey is different. Replace Envy with Kindness and Humility. You are blessed in your own way!",
      "Is this scroll Intentional, or are you just passing time? Be Mindful of how social media makes you feel.",
      "Practice Balance — it's okay to check in, but don't let endless scrolling steal your Focus and peace of mind.",
      "Scroll, scroll, scroll your feed, gently down the screen — but comparing your life to theirs is not what it seems!",
      "Their grass looks greener? That's just a filter, friend. Water your own lawn!",
      "Riddle: What can you look at for hours but never hold? Someone else's life on social media.",
      "As they used to say: 'Comparison is the thief of joy.' Put the phone down and count YOUR blessings!",
      "If jealousy were calories, this scroll session would be a feast. Let Kindness fill you up instead!",
      "Fun fact: Nobody posts their bad hair days. What you see isn't the whole story — enjoy YOUR story!",
      "Old saying: 'What's for you won't pass you by.' Stop envying, start living!",
    ],
  },

  // --- SELF-PROMOTION / VANITY → PRIDE ---
  {
    sin: 'pride',
    urlPatterns: ['linkedin.com/in/', 'linkedin.com/feed', 'twitter.com', 'x.com', 'vsco.co', 'linktr.ee', 'about.me', 'carrd.co', 'behance.net', 'dribbble.com', 'substack.com', '500px.com', 'flickr.com', 'cameo.com', 'tmz.com', 'realself.com'],
    pageKeywords: ['followers', 'following', 'my profile', 'my posts', 'edit profile', 'psychic', 'fortune teller', 'tarot', 'tanning salon', 'tanning bed', 'tanning', 'plastic surgery', 'cosmetic surgery', 'med spa', 'botox', 'facelift', 'tattoo', 'tattoo shop', 'beauty', 'photo studio', 'photography studio', 'photography'],
    messages: [
      "It's great to share your accomplishments, but watch out for Pride. Practice Humility — your worth isn't measured by likes and followers!",
      "Confidence is good, but Pride goes before a fall. Let your work speak for itself with quiet Discipline!",
      "Sharing is fine, but remember: Humility is the foundation of all virtues. Don't let Pride take the wheel!",
      "Are you posting to inspire or to impress? Practice Intentionality and Awareness with what you share.",
      "Self-Respect doesn't require applause from others. Stay grounded in Humility!",
      "Mirror, mirror on the wall — who's the humblest of them all? Hopefully you, after reading this!",
      "Roses are red, your ego is showing — a little Humility keeps your character growing!",
      "Riddle: What inflates without air and pops without a pin? Pride!",
      "As the wise ones said: 'Pride goeth before a fall.' Stay humble, stay standing!",
      "Nobody likes a show-off at the dinner table. Let your actions do the bragging, friend!",
      "Old proverb: 'Empty vessels make the most noise.' Be full of substance, not just self-praise!",
    ],
  },

  // --- VIDEO STREAMING → SLOTH ---
  {
    sin: 'sloth',
    urlPatterns: ['netflix.com', 'hulu.com', 'disneyplus.com', 'hbomax.com', 'max.com', 'peacock', 'paramount', 'crunchyroll', 'twitch.tv', 'youtube.com/watch', 'tv.apple.com', 'primevideo.com', 'amazon.com/gp/video', 'tubi.tv', 'pluto.tv', 'vudu.com', 'plex.tv', 'curiositystream', 'spotify.com', 'music.apple.com', 'pandora.com', 'soundcloud.com', 'deezer.com', 'tidal.com', 'music.youtube.com', 'discoveryplus.com', 'philo.com', 'sling.com', 'fubo.tv', 'fandom.com', 'roblox.com', 'imdb.com', 'buzzfeed.com', 'rottentomatoes.com', 'ign.com', 'screenrant.com', 'gamespot.com', 'polygon.com', 'store.steampowered.com', 'steampowered.com', '9gag.com', 'ifunny.co', 'webtoons.com', 'tapas.io'],
    pageKeywords: ['watch now', 'continue watching', 'play', 'next episode', 'binge', 'movie theater', 'movie theatre', 'cinema', 'showtimes', 'now playing', 'arcade', 'game room', 'record store', 'vinyl records', 'vinyl shop'],
    messages: [
      "Relaxing with a show? Nothing wrong with that! But don't let Sloth keep you on the couch all day. Practice Balance — rest with action!",
      "One episode is fine… but are you avoiding something you should be doing? Discipline means knowing when to stop!",
      "Entertainment is great in Moderation. Make sure you're also being productive today — Diligence is a virtue!",
      "Before you hit 'Next Episode,' practice Mindfulness: is there something more productive I could be doing right now?",
      "Focus and Diligence are the antidotes to Sloth. Enjoy your show, but don't lose your whole day!",
      "Self-Control isn't about never relaxing — it's about choosing when to relax Intentionally, not out of laziness.",
      "🎵 Just one more episode, you say? That's what you said three episodes ago, hey hey! 🎵",
      "Roses are red, the couch is your throne, but Sloth won't help you when goals are unshown!",
      "Riddle: What has a remote, no ambition, and unlimited excuses? A couch potato ruled by Sloth!",
      "Grandma would say: 'The early bird catches the worm.' Netflix never caught a worm for anyone!",
      "Your couch misses you when you leave — but your dreams miss you MORE when you stay.",
      "Old saying: 'Idle hands are the devil's workshop.' Go build something beautiful today!",
      "Plot twist: the best episode is the one where YOU get up and do something amazing.",
    ],
  },

  // --- SPORTS SITES → SLOTH ---
  {
    sin: 'sloth',
    urlPatterns: ['espn.com', 'cbssports.com', 'sports.yahoo.com', 'bleacherreport.com', 'theathletic.com', 'foxsports.com', 'nbcsports.com', 'nfl.com', 'nba.com', 'mlb.com', 'nhl.com', 'mls', 'pga.com', 'ufc.com'],
    pageKeywords: ['box score', 'box scores', 'standings', 'scores', 'highlights', 'game recap', 'final score', 'play-by-play'],
    messages: [
      "Just one more box score, you said. That was five box scores ago, friend!",
      "Checking scores is fun, but don't let Sloth keep you glued to the stats all day. Get up and play a sport yourself!",
      "Sports are exciting, but watching from the sideline all day is Sloth in disguise. Go be active!",
      "You said 'just one more box score' an hour ago. Practice Discipline and step away from the scoreboard!",
      "The best athletes don't just watch — they DO. Close the box scores and go move your body!",
      "Roses are red, the scores are in — but staring at stats all day is where Sloth begins!",
      "If checking box scores burned calories, you'd be an Olympic athlete by now. Go outside!",
      "Riddle: What has endless stats, infinite replays, and zero productivity? A sports binge ruled by Sloth!",
      "Your fantasy team doesn't need you to refresh the page every five minutes. Practice Balance!",
      "The game is over, the score is final — but your to-do list is still waiting. Time to be productive!",
      "Old saying: 'You miss 100% of the shots you never take.' Stop watching and start doing!",
      "Fun fact: No championship was ever won from a couch. Go make YOUR highlight reel today!",
      "One more highlight, one more recap, one more stat... Sloth loves a good sports spiral. Break free!",
    ],
  },

  // --- NEWS / POLITICS / COMMENT SECTIONS → WRATH ---
  {
    sin: 'wrath',
    urlPatterns: ['reddit.com', 'news.ycombinator', 'foxnews', 'cnn.com', 'msnbc', 'breitbart', '4chan', 'dailymail', 'nytimes.com', 'washingtonpost.com', 'huffpost.com', 'bbc.com/news', 'nbcnews.com', 'abcnews.go.com', 'cbsnews.com', 'politico.com', 'thehill.com', 'vox.com', 'vice.com', 'newsmax.com', 'news.yahoo.com', 'theguardian.com', 'nypost.com', 'usatoday.com', 'newsweek.com', 'salon.com', 'slate.com', 'thedailybeast.com', 'axios.com', 'drudgereport.com', 'msn.com', 'businessinsider.com', 'forbes.com', 'techcrunch.com', 'cnet.com'],
    pageKeywords: ['comments', 'reply', 'debate', 'outrage', 'breaking news', 'controversial', 'gun store', 'gun shop', 'firearms', 'shooting range', 'ammunition', 'gun range'],
    messages: [
      "Reading the news and comments can stir up strong feelings. Don't let Wrath take over — respond with Patience, not anger!",
      "It's easy to get angry at what you read online. Remember: Patience and Kindness are the antidotes to Wrath. Take a deep breath!",
      "Before you fire off an angry comment, practice Restraint. Is this worth your peace? Choose Patience over Wrath!",
      "The internet can be frustrating. But letting anger consume you only hurts yourself. Practice Kindness and stay calm!",
      "Practice Awareness right now — is this content making you angry? Mindfulness helps you step back before Wrath takes over.",
      "Discipline means not reacting to every provocation. Respond with Kindness, or simply walk away.",
      "Take a breath, count to ten — Wrath never solved a single problem, friend!",
      "Roses are red, your face might be too — don't let anger make a monster of you!",
      "Riddle: What burns hotter than fire but leaves no ashes? An angry heart. Cool it down!",
      "The old folks knew: 'A soft answer turns away wrath.' Try kindness — it hits different!",
      "Before you type that angry reply, remember: the internet never forgets, but Patience always forgives.",
      "Ancient wisdom: 'He who angers you, controls you.' Don't hand over the remote to Wrath!",
      "Fun fact: No one ever looked back and said 'I'm so glad I sent that angry comment.' Choose peace!",
    ],
  },

  // --- DATING / ADULT CONTENT → LUST ---
  {
    sin: 'lust',
    urlPatterns: ['tinder.com', 'bumble.com', 'hinge.co', 'match.com', 'okcupid', 'pof.com', 'grindr.com', 'pornhub', 'xvideos', 'xnxx', 'xhamster', 'redtube', 'youporn', 'tube8', 'spankbang', 'brazzers', 'onlyfans.com', 'chaturbate', 'stripchat', 'livejasmin', 'cam4', 'bongacams', 'manyvids', 'fansly', 'eharmony.com', 'zoosk.com', 'badoo.com', 'feeld.co', 'ashleymadison.com', 'adultfriendfinder.com'],
    pageKeywords: ['adult content', 'xxx', 'nsfw', 'porn', 'explicit', '18+', 'adults only', 'strip club', 'gentleman club', 'adult entertainment'],
    messages: [
      "Looking for connection is natural, but practice Intentionality — make sure your intentions are pure. Don't let Lust cloud your judgment!",
      "Real love is built on Patience and self-respect, not just attraction. Keep your heart in the right place!",
      "Seeking companionship is a beautiful thing — just practice Self-Control and integrity. Aim for genuine connection, not temptation!",
      "Integrity and self-respect are powerful virtues. Let them guide your search for meaningful relationships!",
      "Swipe left on temptation, swipe right on Self-Respect! Your heart deserves the real deal.",
      "Roses are red, these profiles are fine — but guard your heart, it's one of a kind!",
      "Riddle: What promises thrill but often leaves you empty? Desire without Intention.",
      "Old wisdom: 'Patience is bitter, but its fruit is sweet.' Good things come to those who wait!",
      "Real connection isn't found in a swipe — it's built with Patience, trust, and time.",
    ],
  },

  // --- GAMBLING / BETTING → GREED ---
  {
    sin: 'greed',
    urlPatterns: ['draftkings', 'fanduel', 'betmgm', 'caesars', 'pointsbet', 'bovada', 'bet365', 'pokerstars', 'casino', 'betrivers', 'wynnbet', 'williamhill', 'unibet', 'foxbet', 'mybookie', 'betonline', 'stake.com'],
    pageKeywords: ['place bet', 'wager', 'odds', 'parlay', 'jackpot', 'spin', 'slots'],
    messages: [
      "Gambling can be a slippery slope into Greed. Practice Discipline — set a limit and stick to it!",
      "The house always wins in the long run. Don't let Greed convince you otherwise. Practice Restraint and be wise with your money!",
      "A little fun is fine, but Greed can turn gambling from entertainment into a trap. Self-Control means knowing when to walk away!",
      "Temperance is key here. If you've set a limit, honor it. That takes real Discipline!",
      "Roll the dice, pay the price — Greed at the table is never nice!",
      "Riddle: What takes your money, gives you hope, then takes it again? A game you can't win long-term.",
      "Old saying: 'A bird in the hand is worth two in the bush.' Keep what you've got!",
      "The jackpot whispers 'just one more!' — but your wallet is begging you to walk out the door.",
      "Lady Luck is a terrible financial advisor. Trust Discipline instead!",
    ],
  },

  // --- LAW FIRMS / LAWYERS → GREED ---
  {
    sin: 'greed',
    urlPatterns: ['lawfirm', 'law.com', 'avvo.com', 'findlaw.com', 'justia.com', 'martindale.com', 'lawyers.com', 'nolo.com', '-law.com', '-llp.com', 'legalzoom.com'],
    pageKeywords: ['attorney', 'lawyer', 'law firm', 'law office', 'legal services', 'personal injury', 'free consultation', 'practice areas', 'legal representation', 'case evaluation', 'litigation'],
    messages: [
      "Lawyers and law firms — where Greed often wears a suit and tie! Remember, not every legal battle is worth fighting.",
      "Legal services can be expensive! Practice Restraint and make sure you really need that attorney before signing up.",
      "The law is important, but don't let Greed drive your legal decisions. Seek justice, not just a payout!",
      "Before hiring a lawyer, ask yourself: is this about justice or Greed? Wisdom knows the difference!",
      "Free consultation? Nothing in law is ever truly free. Practice Discernment and read the fine print!",
      "Old saying: 'A lawyer's briefcase can hold more than a banker's vault.' Be wise with your legal choices!",
    ],
  },
];

// ============================================================
// POSITIVE MESSAGES — for productive/work sites
// ============================================================

const POSITIVE_RULES = [
  // --- EMAIL / WORK COMMUNICATION ---
  {
    urlPatterns: ['mail.google.com', 'outlook.office', 'outlook.live', 'mail.yahoo', 'protonmail'],
    virtue: 'Diligence',
    messages: [
      "Checking your email — staying on top of communication shows real responsibility!",
      "Handling your inbox takes Focus and Discipline. You're being proactive and that matters!",
      "Responding to messages and keeping in touch — your Diligence is showing!",
      "Email might not be glamorous, but staying organized is a quiet superpower. Keep it up!",
      "Every replied email is a connection maintained. Your communication skills are a virtue!",
    ],
  },
  // --- PRODUCTIVITY TOOLS ---
  {
    urlPatterns: ['docs.google.com', 'sheets.google.com', 'slides.google.com', 'notion.so', 'trello.com', 'asana.com', 'monday.com', 'jira', 'confluence', 'basecamp', 'clickup', 'chatgpt.com', 'openai.com', 'adobe.com', 'dropbox.com', 'canva.com', 'zoom.us', 'salesforce.com', 'slack.com', 'atlassian.com', 'wix.com', 'squarespace.com', 'godaddy.com', 'namecheap.com', 'mailchimp.com', 'hubspot.com', 'zendesk.com'],
    virtue: 'Discipline',
    messages: [
      "Working in productivity tools — you're clearly someone who gets things done!",
      "Organizing, planning, and creating — that's Discipline in action. Keep building!",
      "Most people just think about being productive. You're actually doing it. Impressive!",
      "Documents, spreadsheets, project boards — you're making real progress. Stay focused!",
      "Your ability to sit down and do the work is a rare and valuable virtue. Don't underestimate it!",
    ],
  },
  // --- LEARNING / CODING ---
  {
    urlPatterns: ['github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com', 'stackexchange.com', 'developer.', 'learn.microsoft', 'codecademy', 'udemy.com', 'coursera.org', 'khanacademy.org', 'edx.org', 'duolingo.com', 'medium.com', 'quora.com', 'linkedin.com/learning', 'skillshare.com', 'masterclass.com'],
    virtue: 'Focus',
    messages: [
      "Learning and building — you're investing in yourself! That's Diligence at its finest!",
      "Coding, studying, problem-solving — your brain is getting a serious workout right now!",
      "Working on your skills sets you apart. Keep that growth mindset going!",
      "Every line of code, every lesson completed — it all adds up to something amazing!",
      "Self-improvement through learning is one of the most powerful things you can do. Keep at it!",
    ],
  },
  // --- SCHOOL / COLLEGE ---
  {
    urlPatterns: ['.edu', 'blackboard.com', 'canvas.instructure.com', 'schoology.com', 'moodle', 'collegeboard.org', 'commonapp.org', 'fafsa.gov', 'studentaid.gov'],
    pageKeywords: ['school district', 'university', 'college', 'campus', 'enrollment', 'admissions', 'student portal', 'academic', 'semester', 'syllabus'],
    virtue: 'Diligence',
    messages: [
      "Education is one of the greatest investments you can make. Your future self is going to thank you!",
      "Hitting the books? That takes Focus and Discipline. You're building a bright future!",
      "School can be tough, but your perseverance through it is what makes you strong. Keep pushing!",
      "Every assignment, every exam, every late-night study session — it's all worth it. Believe that!",
      "Your dedication to education shows incredible character. Not everyone has that drive — but you do!",
    ],
  },
  // --- KIDS LEARNING ---
  {
    urlPatterns: ['khanacademykids', 'abcmouse.com', 'pbskids.org', 'funbrain.com', 'highlightskids.com', 'kids.nationalgeographic.com', 'coolmath4kids.com', 'starfall.com', 'readingeggs.com', 'getepic.com', 'storylineonline.net', 'oxfordowl.co.uk', 'kidsa-z.com', 'prodigygame.com', 'splashlearn.com', 'mathplayground.com', 'ixl.com', 'dreambox.com', 'mysteryscience.com', 'nasa.gov/kidsclub', 'code.org', 'scratch.mit.edu', 'tynker.com', 'abcya.com', 'toytheater.com', 'roomrecess.com', 'turtlediary.com', 'sheppardsoftware.com', 'gusonthego.com', 'geoguessr.com', 'crayola.com', 'artforkidshub.com', 'musiclab.chromeexperiments.com', 'brainpop.com', 'jr.brainpop.com', 'lumosity.com', 'chesskid.com'],
    virtue: 'Wisdom',
    messages: [
      "Learning is one of the best ways to spend your time — and you're doing it right now! Keep it up!",
      "Your curiosity is a superpower! Every new thing you learn makes you smarter and stronger!",
      "This is time SO well spent! Learning new things is the greatest adventure there is!",
      "Your brain is growing right now — and that's the coolest thing in the world! Keep exploring!",
      "Reading, learning, and discovering — you're building skills that will last a lifetime!",
      "Not everyone chooses to learn in their free time, but you do — and that makes you special!",
      "Every question you ask and every lesson you finish makes you wiser. You're on the right track!",
      "Education is a gift you give yourself. And right now, you're giving yourself the best gift there is!",
      "The smartest people never stop learning — and look at you, learning right now! Amazing!",
      "Time spent learning is never wasted. You're making yourself better every single day!",
    ],
  },
  // --- DIY / DO IT YOURSELF ---
  {
    urlPatterns: ['instructables.com', 'familyhandyman.com', 'diynetwork.com', 'thisoldhouse.com', 'bobvila.com', 'craftsy.com', 'abeautifulmess.com', 'brit.co', 'makezine.com', 'hackster.io', 'create.arduino.cc', 'adafruit.com', 'ana-white.com', 'woodmagazine.com', 'popularmechanics.com', 'seriouseats.com', 'gardeningknowhow.com', 'thespruce.com'],
    virtue: 'Self-Reliance',
    messages: [
      "Doing it yourself instead of paying someone else — that's real Self-Reliance! You're saving money AND learning!",
      "DIY is one of the most rewarding things you can do. You're building skills that last a lifetime!",
      "Why pay for it when you can learn to do it yourself? That's smart, resourceful, and empowering!",
      "Every project you tackle yourself is money saved and confidence earned. Keep building!",
      "Learning to fix, build, and create on your own is a lost art — and you're keeping it alive!",
      "Your hands and your brain are the best tools you own. Use them well — and you clearly are!",
      "The satisfaction of doing it yourself is something money can't buy. Great use of your time!",
      "Self-Reliance is a true virtue. Every skill you learn is one less thing you have to pay for!",
      "DIY isn't just about saving money — it's about growing as a person. And you're growing right now!",
      "The world needs more people who can do things themselves. You're becoming one of them!",
    ],
  },
  // --- PLANNING / ORGANIZING ---
  {
    urlPatterns: ['calendar.google.com', 'todoist.com', 'ticktick.com'],
    virtue: 'Intentionality',
    messages: [
      "Planning your day and organizing your life — that's how successful people operate!",
      "A good plan today means less stress tomorrow. Your organizational skills are on point!",
      "Being Intentional with your time is a gift to yourself. You're spending it wisely!",
      "Calendars, to-do lists, and schedules — the tools of someone who's going places!",
    ],
  },
  // --- KNOWLEDGE / RESEARCH ---
  {
    urlPatterns: ['wikipedia.org', 'britannica.com', 'nationalgeographic.com', 'scholar.google', 'howstuffworks.com', 'livescience.com', 'sciencedaily.com', 'smithsonianmag.com', 'todayifoundout.com'],
    virtue: 'Mindfulness',
    messages: [
      "Researching and learning — curiosity is one of the greatest human qualities!",
      "Diving deep into a topic shows real intellectual curiosity. Keep exploring!",
      "The world is full of fascinating things to learn about, and you're out here discovering them!",
      "Seeking knowledge for its own sake is a beautiful thing. Stay curious!",
    ],
  },
  // --- HEALTH / FITNESS ---
  {
    urlPatterns: ['myfitnesspal', 'strava.com', 'fitbit.com', 'headspace.com', 'calm.com', 'peloton', 'nike.com/run', 'webmd.com', 'healthline.com', 'verywellmind.com', 'betterhelp.com', 'talkspace.com', 'psychologytoday.com'],
    virtue: 'Temperance',
    messages: [
      "Tracking your fitness and health — you're taking your well-being seriously!",
      "Whether it's meditation, running, or counting calories — you're investing in yourself!",
      "Your body and mind are connected. By caring for one, you're helping the other. Keep it up!",
      "Fitness apps, meditation, tracking progress — these are the habits of someone who cares about themselves!",
    ],
  },
  // --- FINANCE / BUDGETING ---
  {
    urlPatterns: ['mint.com', 'ynab.com', 'personalcapital', 'nerdwallet.com', 'bankofamerica.com', 'chase.com', 'wellsfargo.com', 'capitalone.com', 'paypal.com', 'venmo.com', 'cashapp.com', 'investopedia.com', 'finance.yahoo.com', 'robinhood.com', 'fidelity.com'],
    virtue: 'Restraint',
    messages: [
      "Managing your money wisely — that's a skill most people wish they had!",
      "Budgeting and financial planning might not be flashy, but it's how real wealth is built!",
      "Your financial discipline today means freedom tomorrow. Smart thinking!",
      "Most people avoid their finances. You're facing them head-on. That takes real courage!",
    ],
  },
  // --- CHARITY / VOLUNTEERING ---
  {
    urlPatterns: ['gofundme.com', 'kiva.org', 'charity', 'donate', 'volunteer', 'habitat.org', 'redcross.org', 'feedingamerica.org', 'volunteermatch.org', 'unitedway.org', 'salvationarmy.org', 'aspca.org'],
    virtue: 'Charity',
    messages: [
      "Giving back to others is one of the most noble things a person can do!",
      "Your generosity makes the world a better place. Never underestimate the power of giving!",
      "Whether it's time, money, or effort — your willingness to help others is truly admirable!",
      "Charity isn't just about money. It's about heart. And yours is clearly in the right place!",
      "The world needs more people like you — generous, kind, and willing to help. Thank you!",
    ],
  },
  // --- CAREER / JOB SEARCH ---
  {
    urlPatterns: ['indeed.com', 'linkedin.com/jobs', 'glassdoor.com', 'ziprecruiter.com', 'monster.com', 'careerbuilder.com', 'usajobs.gov', 'hired.com', 'angel.co/jobs', 'remote.co', 'weworkremotely.com'],
    virtue: 'Diligence',
    messages: [
      "Job hunting is tough, but your persistence will pay off. Keep going!",
      "Every application, every interview, every follow-up — it all gets you closer to the right opportunity!",
      "Looking for work takes real courage and resilience. You've got both. Don't give up!",
      "Your determination to find the right career is inspiring. The right door will open!",
      "The fact that you're actively searching shows initiative and drive. Those qualities will serve you well!",
    ],
  },
  // --- PARKS & RECREATION ---
  {
    urlPatterns: ['nps.gov', 'recreation.gov', 'alltrails.com', 'traillink.com', 'hikingproject.com'],
    pageKeywords: ['parks and recreation', 'parks & recreation', 'state park', 'national park', 'hiking trail', 'campground', 'nature preserve', 'recreation center', 'playground', 'picnic area'],
    virtue: 'Temperance',
    messages: [
      "Getting outdoors is one of the best things you can do for your body and mind!",
      "Parks, trails, and nature — you're choosing adventure over the couch. Love it!",
      "Fresh air, open spaces, and the beauty of nature — what a wonderful way to spend your time!",
      "Planning an outdoor adventure? Your body, mind, and spirit will all thank you!",
      "Trading Wi-Fi for wildlife? That's the kind of balance the world needs more of!",
    ],
  },
  // --- GOVERNMENT / CIVIC RESPONSIBILITY ---
  {
    urlPatterns: ['irs.gov', 'ssa.gov', 'dmv.org', 'usa.gov', 'usps.com', 'voter', 'vote.org'],
    virtue: 'Responsibility',
    messages: [
      "Taking care of civic duties — that's what a responsible citizen looks like!",
      "Not everyone stays on top of their government paperwork, but you do. That's real Responsibility!",
      "Handling official business isn't glamorous, but it's important. Good for you!",
      "Being a responsible citizen means showing up — even for the boring stuff. You're doing great!",
      "Adulting at its finest! Taking care of important business is a quiet but powerful virtue!",
    ],
  },
  // --- FAITH / SPIRITUAL ---
  {
    urlPatterns: ['biblegateway.com', 'youversion.com', 'bible.com', 'openbible.info', 'desiringgod.org', 'gotquestions.org'],
    pageKeywords: ['church', 'ministry', 'sermon', 'bible study', 'worship', 'prayer', 'scripture', 'congregation', 'fellowship'],
    virtue: 'Faith',
    messages: [
      "Nourishing your spirit is just as important as nourishing your body. Beautiful!",
      "Time spent in faith and reflection is never wasted. Keep growing spiritually!",
      "Seeking wisdom and spiritual growth — your soul is in good hands!",
      "Faith is a journey, not a destination. Every step you take matters!",
      "The world is noisy, but you're choosing to listen to what truly matters. That's real Wisdom!",
    ],
  },
  // --- PARENTING / FAMILY ---
  {
    urlPatterns: ['babycenter.com', 'whattoexpect.com', 'parents.com', 'familyeducation.com', 'parentingscience.com'],
    virtue: 'Love',
    messages: [
      "Being a great parent starts with wanting to learn. You're already ahead of the game!",
      "Caring enough to research and prepare — your kids are lucky to have you!",
      "Parenting is the hardest and most rewarding job there is. You're doing amazing!",
      "The fact that you're here looking for answers shows how much you love your family!",
      "Great parents never stop learning. Your dedication to your family is truly inspiring!",
    ],
  },
  // --- VIRTUOUS BUSINESSES (by category — messages match what user is looking at) ---
  {
    urlPatterns: [],
    pageKeywords: ['pet groomer', 'dog grooming', 'pet grooming', 'dog park', 'pet store', 'pet shop', 'veterinar', 'animal hospital', 'pet hospital', 'animal shelter', 'pet adoption', 'pet rescue', 'animal rescue'],
    virtue: 'Compassion',
    messages: [
      "Caring for animals is one of the most compassionate things you can do! Your love for animals shows real Kindness!",
      "Pets bring so much joy and unconditional love. Taking care of them is a beautiful act of Compassion!",
      "A person who loves animals has a good heart. Keep showing that Kindness — the world needs more of it!",
      "Our furry friends depend on us. Your dedication to their well-being is truly virtuous!",
      "Whether it's adoption, grooming, or a vet visit — your love for animals speaks volumes about your character!",
      "Animals can't say thank you, but they sure can feel your love. You're a great pet parent!",
      "The bond between humans and animals is one of life's greatest gifts. Cherish it!",
      "Looking out for our four-legged friends? That's pure Compassion in action!",
      "Every animal deserves love, and you're clearly someone who gives it freely. What a wonderful quality!",
      "They say you can judge a person by how they treat animals — and you're acing it!",
    ],
  },
  {
    urlPatterns: [],
    pageKeywords: ['vitamin', 'supplement', 'nutrition store', 'dentist', 'orthodontist', 'optometrist', 'eye doctor', 'health food', 'chiropractor', 'physical therapy', 'wellness center'],
    virtue: 'Wellness',
    messages: [
      "Taking care of your health is one of the smartest investments you can make! Your body thanks you!",
      "Preventive care shows real Wisdom. You're taking charge of your well-being!",
      "Health is wealth! Staying on top of checkups and nutrition is a true act of Self-Respect!",
      "Your commitment to wellness shows real Discipline. Keep prioritizing your health!",
      "Vitamins, checkups, good nutrition — you're doing all the right things for your body!",
      "Investing in your health today means a better, stronger tomorrow. Smart move!",
      "Not everyone takes the time to care for their health. The fact that you do shows real maturity!",
      "Your body works hard for you every day. Taking care of it is the least — and best — thing you can do!",
      "Wellness isn't a trend, it's a lifestyle. And you're clearly living it. Keep going!",
      "A healthy body supports a healthy mind. You're building both right now!",
    ],
  },
  {
    urlPatterns: ['barnesandnoble.com', 'bookshop.org', 'powells.com', 'thriftbooks.com', 'abebooks.com', 'booksamillion.com', 'betterworldbooks.com', 'alibris.com', 'indiebound.org', 'bookpeople.com', 'amazon.com/books', 'amazon.com/s?k=book', 'amazon.com/kindle'],
    pageKeywords: ['tutoring', 'tutoring center', 'driving school', 'drivers education', 'dance studio', 'dance class', 'dance lessons', 'bookstore', 'book store', 'learning center', 'study group'],
    virtue: 'Growth',
    messages: [
      "Investing in knowledge and learning — that's one of the best things you can do! Your Curiosity is a virtue!",
      "Education and growth are lifelong journeys. Your Dedication to learning is truly admirable!",
      "Whether it's books, lessons, or new skills — your pursuit of knowledge shows real Intentionality!",
      "Learning never stops, and neither does your ambition! Keep growing and stay curious!",
      "A curious mind is a beautiful mind. Keep feeding it with knowledge and new experiences!",
      "The more you learn, the more you grow. And you're clearly someone who never stops growing!",
      "Books, classes, and new skills — you're building the best version of yourself. That's real growth!",
      "Knowledge is the one thing no one can ever take from you. Keep investing in yourself!",
      "Learning something new takes courage and humility. You have both — keep going!",
      "Every lesson learned is a step forward. Your dedication to growth is truly inspiring!",
    ],
  },
  {
    urlPatterns: ['hobbytown.com', 'hobbylobby.com'],
    pageKeywords: ['music store', 'music lessons', 'art supply', 'craft store', 'hobby store', 'hobby shop', 'escape room', 'art class', 'pottery studio', 'art workshop', 'woodworking', 'knitting', 'sewing'],
    virtue: 'Creativity',
    messages: [
      "Creativity feeds the soul! Whether it's art, music, or crafts — you're nurturing your creative spirit!",
      "Making something with your hands or learning an instrument — that's a beautiful use of your time!",
      "The world needs more creativity. Your artistic pursuits show real Passion and Intentionality!",
      "Art, music, and creativity are gifts. Keep exploring and expressing yourself!",
      "Creating something from nothing is one of the most human things you can do. Keep making!",
      "Your creative energy is a gift to the world. Whether it's a painting, a song, or a craft — it matters!",
      "Hobbies and creative projects make life richer. You're choosing to create, not just consume — that's powerful!",
      "Every masterpiece started with someone who just decided to try. Keep creating!",
      "Creativity takes courage, and you've got plenty of it. Whatever you're making, it's going to be great!",
      "The best hobbies are the ones that let you express yourself. Keep that creative spark alive!",
    ],
  },
  {
    urlPatterns: [],
    pageKeywords: ['florist', 'flower shop', 'daycare', 'preschool', 'gift basket', 'greeting card', 'children museum', 'family fun'],
    virtue: 'Kindness',
    messages: [
      "Taking care of family and loved ones is one of life's greatest virtues! You're making a difference!",
      "Flowers, family, and love — these are the things that truly matter. Your Thoughtfulness is showing!",
      "Caring for little ones and spreading joy — that's what life is all about!",
      "Thinking of others before yourself is a beautiful thing. Your Generosity of spirit is showing!",
      "Whether it's flowers for someone special or finding the right care for your little ones — your love shines through!",
      "Family first — and you're clearly someone who lives by that. What a wonderful quality!",
      "The little acts of love and care you do every day add up to something incredible. Keep it up!",
      "Sending flowers, picking out gifts, caring for kids — these are the moments that really matter!",
    ],
  },
];

// ============================================================
// DETECTION LOGIC
// ============================================================

function getPageUrl() {
  return window.location.href.toLowerCase();
}

function getPageText() {
  const body = document.body ? document.body.innerText : '';
  return body.toLowerCase().slice(0, 5000); // only scan first chunk for performance
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================
// SHARED VIRTUE CATEGORIES — used by search engines, Yelp, and page scanning
// ============================================================
const VIRTUE_CATEGORIES = [
  {
    name: 'pets',
    terms: ['pets', 'pet store', 'pet shop', 'pet hospital', 'veterinarian', 'veterinar', 'vet clinic', 'vet hospital', 'animal hospital', 'pet groomer', 'dog groomer', 'dog park', 'animal shelter', 'dog walker', 'pet adoption', 'pet rescue', 'animal rescue', 'puppy', 'kitten', 'pet food', 'pet supplies'],
    messages: [
      "Caring for animals is one of the most compassionate things you can do! Your love for animals shows real Kindness!",
      "Pets bring so much joy and unconditional love. Taking care of them is a beautiful act of Compassion!",
      "A person who loves animals has a good heart. Keep showing that Kindness — the world needs more of it!",
      "Our furry friends depend on us. Your dedication to their well-being is truly virtuous!",
      "Whether it's adoption, grooming, or a vet visit — your love for animals speaks volumes about your character!",
      "Animals can't say thank you, but they sure can feel your love. You're a great pet parent!",
      "The bond between humans and animals is one of life's greatest gifts. Cherish it!",
      "Looking out for our four-legged friends? That's pure Compassion in action!",
      "Every animal deserves love, and you're clearly someone who gives it freely. What a wonderful quality!",
      "They say you can judge a person by how they treat animals — and you're acing it!",
    ],
  },
  {
    name: 'outdoors',
    terms: ['hiking', 'park', 'pier', 'beach', 'zoo', 'aquarium', 'playground', 'campground', 'trail', 'sightseeing', 'walking tour', 'outdoor', 'nature', 'camping', 'kayaking', 'canoeing', 'fishing', 'birdwatching', 'national park', 'state park', 'scenic', 'garden', 'botanical'],
    messages: [
      "Getting outdoors is wonderful! Enjoying nature shows real Balance and Temperance. Have a great time!",
      "Fresh air and movement are great for the soul! Keep exploring the great outdoors!",
      "Nature is the best medicine! Your love for the outdoors shows Mindfulness and Balance. Enjoy!",
      "The great outdoors is calling — and you answered! That's a healthy choice!",
      "Trading screen time for green time? That's one of the best swaps you can make!",
      "Sunshine, fresh air, and adventure — your body and mind will thank you for this!",
      "Exploring nature is food for the soul. Keep feeding that adventurous spirit!",
      "The world is full of beautiful places, and you're out there discovering them. Love that energy!",
      "Step outside, breathe deep, and let nature do its thing. You're making a great choice!",
      "Every trail, beach, and park visit is an investment in your well-being. Keep it up!",
    ],
  },
  {
    name: 'fitness',
    terms: ['gym', 'fitness', 'yoga', 'rock climbing', 'bowling', 'skating', 'kayak', 'golf', 'tennis', 'swimming', 'crossfit', 'gym equipment', 'workout', 'pilates', 'martial arts', 'boxing', 'running', 'marathon', 'triathlon', 'spin class', 'weight training', 'personal trainer'],
    messages: [
      "Taking care of your body is a form of Self-Respect! Your commitment to fitness is admirable!",
      "Exercise isn't just good for the body — it's great for the mind too! Keep up the Discipline!",
      "Staying active takes real Dedication. You're investing in your health and that's a true virtue!",
      "Your body is a temple — and you're treating it right! Keep up the great work!",
      "Sweat today, smile tomorrow! Your commitment to fitness is inspiring!",
      "Strong body, strong mind. You're building both right now and that takes real Discipline!",
      "Not everyone has the motivation to work out, but you do — and that's something to be proud of!",
      "Every rep, every step, every stretch — it all adds up. Your future self is cheering you on!",
      "Choosing fitness over laziness? That's Diligence defeating Sloth, one workout at a time!",
      "The hardest part is showing up, and you're already doing that. Keep pushing!",
    ],
  },
  {
    name: 'education',
    terms: ['bookstore', 'book store', 'book shop', 'bookshop', 'library', 'libraray', 'public library', 'used books', 'used book', 'museum', 'tutoring', 'tutoring center', 'driving school', 'dance studio', 'dance class', 'dance lessons', 'science center', 'planetarium', 'learning center', 'study group', 'book club'],
    messages: [
      "Investing in knowledge and learning — that's one of the best things you can do! Your Curiosity is a virtue!",
      "Education and growth are lifelong journeys. Your Dedication to learning is truly admirable!",
      "Whether it's books, lessons, or new skills — your pursuit of knowledge shows real Intentionality!",
      "Learning never stops, and neither does your ambition! Keep growing and stay curious!",
      "A curious mind is a beautiful mind. Keep feeding it with knowledge and new experiences!",
      "The more you learn, the more you grow. And you're clearly someone who never stops growing!",
      "Books, classes, and new skills — you're building the best version of yourself. That's real growth!",
      "Knowledge is the one thing no one can ever take from you. Keep investing in yourself!",
      "Learning something new takes courage and humility. You have both — keep going!",
      "Every lesson learned is a step forward. Your dedication to growth is truly inspiring!",
    ],
  },
  {
    name: 'creative',
    terms: ['music store', 'instrument', 'escape room', 'art class', 'art classes', 'painting class', 'pottery', 'pottery studio', 'pottery class', 'pottery painting', 'pottery wheel', 'art workshop', 'art studio', 'ceramics', 'ceramic shop', 'ceramics class', 'ceramics studio', 'drawing class', 'music lesson', 'music lessons', 'paint and sip', 'sculpture class', 'art store', 'art supply', 'craft store', 'michaels', 'joann', 'art creation', 'slime', 'craft class', 'hobby store', 'hobby shop', 'hobby lobby', 'hobby', 'woodworking', 'knitting', 'sewing', 'photography class', 'creative workshop', 'do art', 'art near', 'arts and crafts', 'create art', 'make art', 'paint pottery', 'painting studio', 'art place', 'art spot', 'art gallery', 'art museum', 'museum of art', 'gallery exhibit', 'fine art', 'slim kitchen', 'slimkitchen'],
    messages: [
      "Creativity feeds the soul! Whether it's art, music, or crafts — you're nurturing your creative spirit!",
      "Making something with your hands or learning an instrument — that's a beautiful use of your time!",
      "The world needs more creativity. Your artistic pursuits show real Passion and Intentionality!",
      "Art, music, and creativity are gifts. Keep exploring and expressing yourself!",
      "Creating something from nothing is one of the most human things you can do. Keep making!",
      "Your creative energy is a gift to the world. Whether it's a painting, a song, or a craft — it matters!",
      "Hobbies and creative projects make life richer. You're choosing to create, not just consume — that's powerful!",
      "Every masterpiece started with someone who just decided to try. Keep creating!",
      "Creativity takes courage, and you've got plenty of it. Whatever you're making, it's going to be great!",
      "The best hobbies are the ones that let you express yourself. Keep that creative spark alive!",
    ],
  },
  {
    name: 'family',
    terms: ['daycare', 'preschool', 'florist', 'flower shop', 'gift basket', 'greeting card', 'hallmark', 'card store', 'card shop', 'family fun', 'kids activities', 'children museum', 'family event'],
    messages: [
      "Taking care of family and loved ones is one of life's greatest virtues! You're making a difference!",
      "Flowers, family, and love — these are the things that truly matter. Your Thoughtfulness is showing!",
      "Caring for little ones and spreading joy — that's what life is all about!",
      "Thinking of others before yourself is a beautiful thing. Your Generosity of spirit is showing!",
      "Whether it's flowers for someone special or finding the right care for your little ones — your love shines through!",
      "Family first — and you're clearly someone who lives by that. What a wonderful quality!",
      "The little acts of love and care you do every day add up to something incredible. Keep it up!",
      "Sending flowers, picking out gifts, caring for kids — these are the moments that really matter!",
    ],
  },
  {
    name: 'health',
    terms: ['dentist', 'orthodontist', 'eye doctor', 'optometrist', 'vitamin', 'supplement', 'health food', 'nutrition', 'chiropractor', 'physical therapy', 'urgent care', 'doctor', 'clinic', 'wellness center', 'health store', 'slim kitchen', 'slimkitchen'],
    messages: [
      "Taking care of your health is one of the smartest investments you can make! Your body thanks you!",
      "Preventive care shows real Wisdom. You're taking charge of your well-being!",
      "Health is wealth! Staying on top of checkups and nutrition is a true act of Self-Respect!",
      "Your commitment to wellness shows real Discipline. Keep prioritizing your health!",
      "Vitamins, checkups, good nutrition — you're doing all the right things for your body!",
      "Investing in your health today means a better, stronger tomorrow. Smart move!",
      "Not everyone takes the time to care for their health. The fact that you do shows real maturity!",
      "Your body works hard for you every day. Taking care of it is the least — and best — thing you can do!",
      "Wellness isn't a trend, it's a lifestyle. And you're clearly living it. Keep going!",
      "A healthy body supports a healthy mind. You're building both right now!",
    ],
  },
  {
    name: 'finance',
    terms: ['bank', 'credit union', 'financial advisor', 'savings account', 'investment', 'retirement planning'],
    messages: [
      "Managing your finances responsibly — that's Restraint and Discipline working together!",
      "Being smart with money is a real virtue. Your Financial Awareness is admirable!",
      "Planning for the future takes real foresight. Your financial responsibility is showing!",
      "Saving, budgeting, and planning ahead — these are the habits that build a secure future!",
      "Not everyone has the discipline to manage money wisely. You clearly do — keep it up!",
    ],
  },
  {
    name: 'homeImprovement',
    terms: ['paint store', 'paint shop', 'sherwin-williams', 'sherwin williams', 'benjamin moore', 'behr', 'valspar', 'house paint', 'interior paint', 'exterior paint', 'lawn care', 'lawn service', 'lawn mower', 'lawn maintenance', 'landscaping', 'landscaper', 'garden center', 'garden store', 'gardening', 'garden supplies', 'nursery plants', 'plant nursery', 'grow your own', 'vegetable garden', 'herb garden', 'raised bed', 'compost', 'seed store', 'seeds', 'planting', 'home improvement', 'home repair', 'home renovation', 'remodel', 'remodeling', 'contractor', 'handyman', 'plumber', 'plumbing', 'electrician', 'roofing', 'roofer', 'flooring', 'tile store', 'cabinet', 'countertop', 'fence', 'fencing', 'deck building', 'power washing', 'pressure washing', 'gutter', 'insulation', 'drywall', 'home depot', 'lowes', 'menards', 'ace hardware', 'true value', 'hardware store'],
    messages: [
      "Improving your home is an investment in your life! Your Diligence and hard work are paying off!",
      "Whether it's a fresh coat of paint or a new garden — you're making your space better. That takes real Initiative!",
      "Home improvement takes patience, planning, and effort. You've got all three — keep building!",
      "Growing your own food? That's Self-Sufficiency at its finest! Your garden is a gift that keeps on giving!",
      "A well-kept home reflects a well-kept mind. Your attention to your living space shows real Pride in the best way!",
      "Lawn care, gardening, painting — these are acts of Stewardship. You're taking care of what matters!",
      "There's something deeply satisfying about working with your hands. Your home improvement efforts are truly virtuous!",
      "Planting seeds today, harvesting tomorrow — that's Patience and Foresight working together!",
      "A beautiful home doesn't happen by accident. It takes Dedication, and you clearly have it!",
      "DIY spirit is alive and well! Your willingness to improve your space shows real Resourcefulness!",
    ],
  },
  {
    name: 'thrift',
    terms: ['thrift store', 'thrift shop', 'thrift', 'goodwill', 'salvation army', 'savers', 'value village', 'consignment', 'consignment shop', 'resale', 'resale shop', 'secondhand', 'second hand', 'dollar store', 'dollar tree', 'dollar general', 'family dollar', 'five below', '99 cent', '99 cents', 'bargain', 'discount store', 'clearance', 'used clothing', 'used furniture', 'garage sale', 'yard sale', 'estate sale', 'flea market'],
    messages: [
      "Shopping smart and stretching your dollar — that's real Financial Wisdom! Thrift is a true virtue!",
      "Why pay full price when you can find amazing deals? Your Frugality is something to be proud of!",
      "Thrift shopping is good for your wallet AND the planet! Reusing and recycling is an act of Stewardship!",
      "Finding treasure at a bargain? That's not cheap — that's Resourceful! Keep saving wisely!",
      "Every dollar saved is a dollar earned. Your smart shopping shows real Discipline and Self-Control!",
      "Thrift stores, dollar stores, and secondhand finds — you're proving that value doesn't require a big price tag!",
      "Reuse, recycle, and save money while doing it. Your Frugality is an inspiration!",
      "Being mindful of your spending is a sign of Maturity and Wisdom. Great choices!",
      "Not everything needs to be brand new. Your willingness to shop secondhand shows real character!",
      "A penny saved is a penny earned — and you're earning plenty! Keep up the smart shopping!",
    ],
  },
];

// ============================================================
// SHARED SIN TERMS — used by search engines and Yelp
// ============================================================
const SIGNAL_SIN_TERMS = {
  greed: ['shopping', 'clothes', 'clothing', 'boutique', 'fashion', 'shoes',
    'jewelry', 'furniture', 'retail', 'outlet', 'vintage', 'antique',
    'electronics', 'gifts', 'toys', 'home goods', 'accessories', 'mall',
    'shoe store', 'department store', 'cosmetics', 'beauty supply', 'pawn shop',
    'toy store',
    'jewelry store', 'watch store', 'sunglasses', 'casino'],
  gluttony: ['restaurant', 'restaurants', 'food', 'pizza', 'sushi', 'burger',
    'taco', 'ramen', 'pho restaurant', 'pho soup', 'pho noodle', 'steakhouse', 'seafood', 'bakery', 'deli', 'buffet',
    'brunch', 'dinner', 'lunch', 'breakfast', 'cafe', 'coffee', 'dining',
    'grocery', 'supermarket', 'bar and grill', 'sports bar', 'cocktail bar', 'wine bar', 'grill', 'chinese', 'mexican', 'italian',
    'thai', 'indian', 'japanese', 'korean', 'vietnamese', 'mediterranean',
    'fast food', 'ice cream', 'gelato', 'frozen yogurt', 'donut', 'donuts', 'sandwich', 'wings', 'bbq', 'barbecue', 'barbeque',
    'candy', 'candies', 'chocolate', 'sweets', 'sweet treats', 'dessert', 'desserts', 'pastry', 'pastries', 'cupcake', 'cupcakes', 'cake', 'cakes', 'pie', 'pies', 'cookie', 'cookies', 'brownie', 'brownies', 'nuts',
    'nightclub', 'night club', 'pub', 'tavern', 'brewery', 'winery',
    'liquor store', 'liquor', 'wine shop', 'wine store', 'beer'],
  sloth: ['gaming', 'video game', 'internet cafe', 'vr lounge', 'esports',
    'hookah', 'vape', 'day spa', 'spa near', 'spa and', 'massage', 'movie theater', 'movie theatre', 'cinema',
    'arcade', 'smoke shop', 'cigar', 'tobacco', 'record store', 'vinyl records', 'vinyl shop'],
  envy: ['nail salon', 'hair salon', 'auto dealer', 'car dealer',
    'car dealership', 'dealership', 'phone store', 'cell phone', 'verizon', 'att store',
    't-mobile', 'mobile store', 'perfume', 'cologne', 'fragrance'],
  pride: ['tattoo', 'tattoo shop', 'tattoo parlor',
    'car wash', 'wedding venue', 'bridal shop', 'bridal',
    'psychic', 'fortune teller', 'tanning salon', 'tanning',
    'plastic surgeon', 'plastic surgery', 'med spa', 'cosmetic surgery',
    'photo studio', 'photography studio', 'photography', 'beauty',
    'dress store', 'dress shop', 'dresses'],
  wrath: ['gun store', 'gun shop', 'gun range', 'shooting range', 'firearms'],
  lust: ['strip club', 'stripclub', 'adult entertainment', 'gentleman club', 'gentlemens club'],
};

// ============================================================
// SEARCH ENGINE QUERY EXTRACTION
// Reads the user's search query from Google, Bing, DuckDuckGo,
// Yahoo, Yelp, and Google Maps URLs.
// ============================================================
function getSearchSignal(url) {
  try {
    const urlObj = new URL(window.location.href);
    const host = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();

    // Google Search & Google Maps
    if (host.includes('google.com')) {
      return (urlObj.searchParams.get('q') || '').toLowerCase();
    }
    // Bing
    if (host.includes('bing.com')) {
      return (urlObj.searchParams.get('q') || '').toLowerCase();
    }
    // DuckDuckGo
    if (host.includes('duckduckgo.com')) {
      return (urlObj.searchParams.get('q') || '').toLowerCase();
    }
    // Yahoo Search
    if (host.includes('search.yahoo.com')) {
      return (urlObj.searchParams.get('p') || '').toLowerCase();
    }
    // Yelp
    if (host.includes('yelp.com')) {
      const findDesc = (urlObj.searchParams.get('find_desc') || '').toLowerCase();
      const cflt = (urlObj.searchParams.get('cflt') || '').toLowerCase();
      const query = (findDesc + ' ' + cflt).trim();
      if (query) return query;
      // For /biz/ pages, use the URL slug
      if (path.includes('/biz/')) {
        return path.split('/biz/')[1].split('?')[0].replace(/-/g, ' ');
      }
      return '';
    }
    // Google Maps
    if (host.includes('google.com') && path.includes('/maps')) {
      return (urlObj.searchParams.get('q') || '').toLowerCase();
    }
  } catch (e) {}
  return '';
}

// ============================================================
// SIGNAL-BASED DETECTION
// Given a search query string, check virtue categories then sins.
// Returns a result object or null.
// ============================================================
function checkSignalForResult(signal, enabledSins) {
  if (!signal) return null;

  // Check virtue categories first
  for (const cat of VIRTUE_CATEGORIES) {
    if (cat.terms.some(kw => signal.includes(kw))) {
      return {
        type: 'positive',
        sinKey: null,
        emoji: '😇',
        name: 'Virtue',
        color: '#81c784',
        message: pickRandom(cat.messages),
      };
    }
  }

  // Check sin terms
  const sinPriority = ['gluttony', 'greed', 'lust', 'sloth', 'envy', 'pride', 'wrath'];
  for (const sinType of sinPriority) {
    const terms = SIGNAL_SIN_TERMS[sinType];
    if (terms && terms.some(kw => signal.includes(kw))) {
      if (enabledSins && enabledSins[sinType] === false) continue;
      const rule = SITE_RULES.find(r => r.sin === sinType);
      if (rule) {
        const sin = SINS[sinType];
        return {
          type: 'warning',
          sinKey: sinType,
          emoji: sin.emoji,
          name: sin.name,
          color: sin.color,
          message: pickRandom(rule.messages),
        };
      }
    }
  }

  return null;
}

// List of search engine hostnames — if we're on one and the signal didn't match,
// don't fall through to page text scanning (too many false positives)
function isSearchEngine(url) {
  return url.includes('google.com') || url.includes('bing.com') ||
    url.includes('duckduckgo.com') || url.includes('search.yahoo.com') ||
    url.includes('yelp.com');
}

function detectPageContentSin(url, text, enabledSins) {
  const source = `${url} ${text}`;
  const sinPriority = ['gluttony', 'greed', 'lust', 'sloth', 'envy', 'pride', 'wrath'];
  const scoredMatches = [];

  for (const rule of SITE_RULES) {
    if (enabledSins && enabledSins[rule.sin] === false) continue;
    if (!rule.pageKeywords || rule.pageKeywords.length === 0) continue;

    const matchedKeywords = rule.pageKeywords.filter(keyword => source.includes(keyword));
    if (matchedKeywords.length > 0) {
      scoredMatches.push({ rule, matchedKeywords, matchCount: matchedKeywords.length });
    }
  }

  if (scoredMatches.length === 0) return null;

  scoredMatches.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return sinPriority.indexOf(a.rule.sin) - sinPriority.indexOf(b.rule.sin);
  });

  const best = scoredMatches[0];
  if (best.matchCount < 2) return null;

  const sin = SINS[best.rule.sin];
  return {
    type: 'warning',
    sinKey: best.rule.sin,
    emoji: sin.emoji,
    name: sin.name,
    color: sin.color,
    message: pickRandom(best.rule.messages),
  };
}

function detectSin(settings) {
  const url = getPageUrl();
  const text = getPageText();
  const enabledSins = (settings && settings.enabledSins) || null;

  // Step 1: Try search query detection (Google, Bing, DuckDuckGo, Yahoo, Yelp)
  const signal = getSearchSignal(url);
  if (signal) {
    const result = checkSignalForResult(signal, enabledSins);
    if (result) return result;
  }

  // If we're on a search engine and nothing matched, return null
  // (don't scan Google's page text — it would match everything)
  if (isSearchEngine(url)) return null;

  // Drug stores are neutral — no sin or virtue banner
  if (['cvs.com', 'walgreens.com', 'riteaid.com'].some(pattern => url.includes(pattern))) {
    return null;
  }

  // First check positive rules by URL
  for (const rule of POSITIVE_RULES) {
    for (const pattern of rule.urlPatterns) {
      if (url.includes(pattern)) {
        return {
          type: 'positive',
          sinKey: null,
          emoji: '😇',
          name: 'Virtue',
          color: '#81c784',
          message: pickRandom(rule.messages),
        };
      }
    }
  }

  // Then check positive rules by page content keywords
  for (const rule of POSITIVE_RULES) {
    if (!rule.pageKeywords || rule.pageKeywords.length === 0) continue;
    let matchCount = 0;
    for (const keyword of rule.pageKeywords) {
      if (text.includes(keyword)) matchCount++;
    }
    if (matchCount >= 2) {
      return {
        type: 'positive',
        sinKey: null,
        emoji: '😇',
        name: 'Virtue',
        color: '#81c784',
        message: pickRandom(rule.messages),
      };
    }
  }

  // Prefer virtue from the actual page content before generic shopping warnings
  const normalizedUrl = url.replace(/[^a-z0-9]/g, '');
  for (const cat of VIRTUE_CATEGORIES) {
    const hasUrlMatch = cat.terms.some(term => {
      const compactTerm = term.replace(/[^a-z0-9]/g, '');
      return compactTerm && normalizedUrl.includes(compactTerm);
    });

    if (hasUrlMatch) {
      return {
        type: 'positive',
        sinKey: null,
        emoji: '😇',
        name: 'Virtue',
        color: '#81c784',
        message: pickRandom(cat.messages),
      };
    }

    let matchCount = 0;
    for (const term of cat.terms) {
      if (text.includes(term)) matchCount++;
    }

    if (matchCount >= 2) {
      return {
        type: 'positive',
        sinKey: null,
        emoji: '😇',
        name: 'Virtue',
        color: '#81c784',
        message: pickRandom(cat.messages),
      };
    }
  }

  // Then let the actual page content decide the sin on mixed shopping sites
  const pageSpecificSin = detectPageContentSin(url, text, enabledSins);
  if (pageSpecificSin) return pageSpecificSin;

  // Finally fall back to broad site-based matches
  for (const rule of SITE_RULES) {
    if (enabledSins && enabledSins[rule.sin] === false) continue;

    for (const pattern of rule.urlPatterns) {
      if (url.includes(pattern)) {
        const sin = SINS[rule.sin];
        return {
          type: 'warning',
          sinKey: rule.sin,
          emoji: sin.emoji,
          name: sin.name,
          color: sin.color,
          message: pickRandom(rule.messages),
        };
      }
    }
  }

  return null;
}

// ============================================================
// BANNER UI
// ============================================================

function showBanner(result, premiumSettings) {
  // Don't show duplicates
  if (document.getElementById('deadly-sin-banner')) return;

  const displayEmoji = result.displayEmoji || result.emoji;
  const premium = premiumSettings || {};
  const isPremiumUser = premium.isPremium || false;
  const settings = premium.settings || {};
  const bannerStyle = premium.bannerStyle || 'default';

  const banner = document.createElement('div');
  banner.id = 'deadly-sin-banner';
  banner.className = result.type === 'positive' ? 'dsb-positive' : 'dsb-warning';

  // Apply banner style class
  if (bannerStyle && bannerStyle !== 'default') {
    banner.classList.add('dsb-style-' + bannerStyle);
  }

  // Apply neon custom color via CSS custom property
  if (bannerStyle === 'neon') {
    const isVirtue = result.type === 'positive';
    const neonColor = isVirtue ? (premium.neonVirtueColor || '#33ff66') : (premium.neonColor || '#ff3333');
    banner.style.setProperty('--neon-color', neonColor);
  }

  // Apply video custom text color
  if (bannerStyle === 'video') {
    const isVirtue = result.type === 'positive';
    const vidColor = isVirtue ? (premium.videoVirtueColor || '#00ff41') : (premium.videoTextColor || '#00ff41');
    banner.style.setProperty('--video-text-color', vidColor);
  }

  const isWarning = result.type === 'warning';

  // Apply font immediately before building HTML (skip for video style — it uses its own font)
  if (bannerStyle !== 'video' && isPremiumUser && settings.messageFont && settings.messageFont !== 'default') {
    banner.style.setProperty('font-family', settings.messageFont, 'important');
  }

  banner.innerHTML = `
    <div class="dsb-inner">
      <div class="dsb-text">
        <div class="dsb-message">${result.message}</div>
        <div class="dsb-title" style="color: ${result.color}">
          ${isWarning ? '<span style="font-size:26px">' + displayEmoji + '</span> Watch out for ' + result.name + ', one of the 7 WebLY Sins! <span style="font-size:26px">' + displayEmoji + '</span>' : '<span style="font-size:26px">😇</span> Virtue Spotted! <span style="font-size:26px">😇</span>'}
        </div>
      </div>
      <button class="dsb-close" id="dsb-close-btn" aria-label="Close">&times;</button>
    </div>
  `;

  // Apply scroll SVG background
  if (bannerStyle === 'scroll') {
    const inner = banner.querySelector('.dsb-inner');
    if (inner) {
      inner.style.backgroundImage = "url('" + chrome.runtime.getURL('scroll-bg.svg') + "')";
      inner.style.backgroundSize = '100% 100%';
      inner.style.backgroundRepeat = 'no-repeat';
    }
  }

  // Apply premium color and flash immediately
  if (isPremiumUser) {
    const inner = banner.querySelector('.dsb-inner');
    if (inner) {
      // Skip background color override for video and neon styles (they have their own look)
      if (bannerStyle !== 'video' && bannerStyle !== 'neon') {
        const colorKey = isWarning ? 'warningColor' : 'praiseColor';
        if (settings[colorKey]) {
          inner.style.background = settings[colorKey];
        }
      }
    }
    if (bannerStyle !== 'video' && settings.messageFont && settings.messageFont !== 'default') {
      const msg = banner.querySelector('.dsb-message');
      const title = banner.querySelector('.dsb-title');
      if (msg) msg.style.setProperty('font-family', settings.messageFont, 'important');
      if (title) title.style.setProperty('font-family', settings.messageFont, 'important');
    }
    if (settings.flashBanner) {
      banner.classList.add('dsb-flashing');
    }
  }

  document.body.appendChild(banner);

  // Animate in (double rAF ensures CSS transition triggers)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      banner.classList.add('dsb-visible');
    });
  });

  // Close button
  document.getElementById('dsb-close-btn').addEventListener('click', () => {
    banner.classList.remove('dsb-visible');
    setTimeout(() => banner.remove(), 300);
  });

  // Auto-dismiss after 15 seconds
  setTimeout(() => {
    if (banner.parentNode) {
      banner.classList.remove('dsb-visible');
      setTimeout(() => banner.remove(), 300);
    }
  }, 15000);
}

// ============================================================
// MAIN — Run on page load
// ============================================================

function init() {
  try {
    chrome.storage.local.get(['enabled', 'isPremium', 'settings', 'whitelist', 'bannerStyle', 'videoTextColor', 'neonColor', 'videoVirtueColor', 'neonVirtueColor'], (result) => {
      if (result.enabled === false) return;

      const settings = result.settings || {};
      const isPremium = result.isPremium === true;

      // Check whitelist — skip if this site is exempt (premium feature)
      if (isPremium) {
        const whitelist = result.whitelist || [];
        const currentHost = window.location.hostname.replace(/^www\./, '').toLowerCase();
        const currentUrl = window.location.href.toLowerCase();
        const isWhitelisted = whitelist.some(site => 
          currentHost === site || currentHost.endsWith('.' + site) || currentUrl.includes(site)
        );
        if (isWhitelisted) return;
      }

      const premiumSettings = isPremium
        ? { isPremium: true, settings, bannerStyle: result.bannerStyle || 'default', videoTextColor: result.videoTextColor || '#00ff41', neonColor: result.neonColor || '#ff3333', videoVirtueColor: result.videoVirtueColor || '#00ff41', neonVirtueColor: result.neonVirtueColor || '#33ff66' }
        : { isPremium: false, settings: {}, bannerStyle: 'default' };

      setTimeout(() => {
        try {
          // Free users monitor all sins; premium users respect their toggle choices
          const detected = detectSin(isPremium ? settings : {});
          if (!detected) return;

          // If premium and it's a sin, ask background for a rotating emoji
          if (isPremium && detected.sinKey) {
            chrome.runtime.sendMessage(
              { type: 'getEmoji', sin: detected.sinKey },
              (response) => {
                if (response && response.emoji) {
                  detected.displayEmoji = response.emoji;
                }
                showBanner(detected, premiumSettings);
              }
            );
          } else {
            showBanner(detected, premiumSettings);
          }
        } catch (e) {
          console.log('7 WebLY Sins: detection error', e);
        }
      }, 2000);
    });
  } catch (e) {
    setTimeout(() => {
      try {
        const detected = detectSin(null);
        if (detected) showBanner(detected);
      } catch (err) {
        console.log('7 WebLY Sins: error', err);
      }
    }, 2000);
  }
}

init();

// SPA navigation detection — re-run detection when URL changes without a full page reload
// (covers Yelp, Google, and other single-page apps)
let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    // Remove any existing banner so a new one can appear
    const existing = document.getElementById('deadly-sin-banner');
    if (existing) existing.remove();
    init();
  }
}, 1500);

// Debug: confirm script is loaded
console.log('7 WebLY Sins: content script loaded on', window.location.href);
