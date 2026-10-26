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
  }
});
export function allowedSinglePair(source) {
 const entry=SINGLE_PAIR_EXCEPTIONS[source.ref];
 return !!entry && source.hebrew === entry.hebrew && source.english === entry.english;
}
