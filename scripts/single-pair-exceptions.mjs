// Exact-source-bound exceptions. Do not extend to unrelated verses or editions.
export const SINGLE_PAIR_EXCEPTIONS = Object.freeze({
  "Genesis 30:10": {
    "reason": "Hebrew begins with bore, while English places bore after the complete subject.",
    "hebrew": "וַתֵּ֗לֶד זִלְפָּ֛ה שִׁפְחַ֥ת לֵאָ֖ה לְיַעֲקֹ֥ב בֵּֽן׃",
    "english": "And Zilpah, Leah's handmaid, bore a son to Jacob."
  },
  "Exodus 23:32": {
    "reason": "Covenant ends the Hebrew but precedes both objects in English.",
    "hebrew": "לֹֽא־תִכְרֹ֥ת לָהֶ֛ם וְלֵאלֹֽהֵיהֶ֖ם בְּרִֽית׃",
    "english": "You shall not make a covenant with them or with their gods."
  },
  "Deuteronomy 23:2": {
    "reason": "The prohibition begins the Hebrew but follows the complete subject in English.",
    "hebrew": "לֹֽא־יָבֹ֧א פְצֽוּעַ־דַּכָּ֛א וּכְר֥וּת שׇׁפְכָ֖ה בִּקְהַ֥ל יְהֹוָֽה׃&nbsp;{ס}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
    "english": "A petzua dakkah [one whose testicles have been maimed or crushed] and a keruth shafchah [one whose membrum is cut, so that the sperm is not ejected but drips, obviating conception] shall not come into the congregation of the L-rd."
  },
  "Genesis 8:22": {
    "reason": "Hebrew places shall not cease after the list; English places No more shall cease before it.",
    "hebrew": "עֹ֖ד כׇּל־יְמֵ֣י הָאָ֑רֶץ זֶ֡רַע וְ֠קָצִ֠יר וְקֹ֨ר וָחֹ֜ם וְקַ֧יִץ וָחֹ֛רֶף וְי֥וֹם וָלַ֖יְלָה לֹ֥א יִשְׁבֹּֽתוּ׃",
    "english": "No more shall cease, all the days of the earth, seed-time [half of Tishrei, Marcheshvan, and half of Kislev], and harvest-time [half of Nissan, Iyyar, and half of Sivan], cold-season [half of Kislev, Teveth, and half of Shvat], and hot season [half of Av, Elul, and half of Tishrei], summer-fruit season [half of Sivan, Tammuz, and half of Av], and winter-fruit season [half of Shvat, Adar, and half of Nissan], and day and night [shall not cease (whence it is seen that all the days of the flood they did cease)]."
  },
  "Genesis 9:4": {
    "reason": "Hebrew places shall not eat at the end; English places it before flesh.",
    "hebrew": "אַךְ־בָּשָׂ֕ר בְּנַפְשׁ֥וֹ דָמ֖וֹ לֹ֥א תֹאכֵֽלוּ׃",
    "english": "Only, you shall not eat flesh with its life [(the ban on ever min hachai — flesh torn from a living animal)] — blood [(the ban on blood from a living animal)]."
  }
});
export function allowedSinglePair(source) {
 const entry=SINGLE_PAIR_EXCEPTIONS[source.ref];
 return !!entry && source.hebrew === entry.hebrew && source.english === entry.english;
}
