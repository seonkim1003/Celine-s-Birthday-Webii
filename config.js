window.BIRTHDAY_CONFIG = {
  intro: {
    title: "Happy Birthday Celineee~",
    dateText: "February 24, 2010",
    nameplate: "Dear Celine Myoung",
    subtitle: "A surprise game with three memory scenes made just for you.",
    buttonText: "Start Game",
    portraitUrl: "./assets/portrait.png"
  },
  phases: [
    {
      id: "scene1",
      title: "Scene 1: Field Camp",
      tag: "BEST Training",
      objective: "Collect all sparks, then unlock the memory card.",
      prompt: "Tap each glowing spark to relive this moment.",
      memory: "This was after they received BEST Training. They both went to the field and got paired up as an evangelism group. Isaac didn't expect much, but when he started running, Celine decided to follow him, which he thought was very cool of her. This was their first real memory together and the start of their friendship.",
      personalLetter: "Dear Celine, as you probably already know, I think this is the start of a very interesting relationship. Honestly at this time I only knew Hana and wasn't really close with anyone else, but seeing you following what I did, even though I wasn't really close with you and even running with me, thought that you're a really cool and nice person for doing that. Like, why would you start running with me, man? I was 99.999% expecting you to just say no and to reject me and then we just laughed it off but you actually ran with me and I was like really really shocked. And I think this small moment was very reflective of your kind and warm-hearted nature of following or helping others when they ask. So Thank You Celine :D",
      note: "",
      imageUrl: "./assets/scene1.png",
      videoUrl: "",
      mediaAlt: "Group picture at the field"
    },
    {
      id: "scene2",
      title: "Scene 2: Come Eat With Us",
      tag: "After Worship",
      objective: "Watch Celine find Isaac at the car, invite him, and bring him back to eat with the group.",
      prompt: "The memory unlocks once everyone is back at the table together.",
      memory: "After worship, Isaac always went to his car to watch his phone alone. He always just played Brawl Stars, played Clash Royale, and overall just did his own thing right after Pulpit Message. But as Celine and Isaac got closer, Celine invited him to eat with them. So now this one lonely boy who just went to his car to play games is eating with other youth group members, and even looking at it now, the reason he's more involved in church is due to Celine's kind heart. So without Celine he wouldn't be so immersed in the church stream.",
      personalLetter: "Honestly Celine, I really can't be more grateful for this incident. I always just, right after pulpit message, ran out of church to just play games on my phone and do my own thing, being a complete loser. But you asked me to eat with you and your kind-heartedness invited me so I wouldn't be alone. Honestly, that actually really helped me a lot to get me out of that mindset. Through you, I became more involved in the church, becoming youth group's VP, being a lot closer to other members of church, and overall, I think I received more blessings through you. Thank you for always being that co-worker who's there to answer my texts, who's there for me, who's there to always comfort me whenever I may fall into unbelief. Even though I call you names like Fatty Myoung or Myungdwaeji, I really want to say that you really changed my life. Thank You :D",
      note: "",
      imageUrl: "./assets/scene2.png",
      videoUrl: "",
      mediaAlt: "Group conversation by gate"
    },
    {
      id: "scene3",
      title: "Scene 3: Always Here",
      tag: "Late Nights",
      objective: "Watch Celine and Isaac part ways and head home, then stay connected through their phones.",
      prompt: "The memory unlocks when Celine sends her message.",
      memory: "Their relationship didn't stop at church; rather, they became team ministers in their own respective fields. They constantly shared what they're thinking, shared what they're doing, and overall became each other's co-workers to do this evangelism movement with. Whenever Isaac had problems he always told Celine, and Celine with her kind-heartedness would always comfort Isaac regardless of how much she had on her plate. Even up to this moment, even as of right now, Isaac constantly tells her his problems and Celine never fails to comfort Isaac, for which Isaac has unending thanksgiving to her.",
      personalLetter: "Wow Celine you went through a lot for me. Although it seems like your schedule is a lot busier and you don't come home until eight, you always find a way to respond to me and find a way to comfort me even though I may rage bait you saying that I forgot. Honestly even when I'm writing this I'm still in problems but you're always there to help me, to give me words of encouragement, to help me stay in the stream of the word, and overall help me to realize that problems are problems but God's own time schedule for me. I really do appreciate you Celine for being that person who I could just randomly text and always get an answer that I want, and always making me leave the conversation with a healthier and calmer heart. Thanks for making me happier Celine \u3140\u3140\u3140",
      note: "",
      imageUrl: "./assets/scene3.png",
      videoUrl: "",
      mediaAlt: "Celebration collage photo"
    }
  ],
  conclusion: {
    title: "Happy Birthday Celine!! :D",
    message: "Celine, I give you my thanks again for always being with me, and always being the co-worker who I could do the evangelism movement with. I'm gonna be honest with you, I was honestly taking church very lightly. Always dozing off during pulpit message, barely remembering the youth message title. But honestly, after I met you, I realized a lot of changes in my life. I now not only remember the youth message and pulpit message, but I'm truly using the Word of God in my life and applying it to my field. I even have darakbang with your brother, even though just a year ago I was the one getting darakbang.\n\nI really hope you enjoyed this small little website that I made. And hopefully this doesn't feel too childish for you. Although this website looks like a ten-year-old drew it, I really did put my time and effort into this. I really hope we stay together in this evangelism movement and always be there for each other. Happy Birthday to my favorite disciple and my co-worker Celine Fatty Myoung :D",
    note: "",
    replayButtonText: "Play Again",
    galleryImages: [
      "./assets/gallery1.png",
      "./assets/gallery2.png",
      "./assets/gallery3.png",
      "./assets/gallery4.png",
      "./assets/gallery5.png",
      "./assets/gallery6.png",
      "./assets/gallery7.png",
      "./assets/gallery8.png"
    ]
  }
};

(function () {
  var im = window.BIRTHDAY_IMAGES;
  if (!im) return;
  if (im.portrait) window.BIRTHDAY_CONFIG.intro.portraitUrl = im.portrait;
  if (im.scene1) window.BIRTHDAY_CONFIG.phases[0].imageUrl = im.scene1;
  if (im.scene2) window.BIRTHDAY_CONFIG.phases[1].imageUrl = im.scene2;
  if (im.scene3) window.BIRTHDAY_CONFIG.phases[2].imageUrl = im.scene3;
  if (im.gallery1) window.BIRTHDAY_CONFIG.conclusion.galleryImages = [ im.gallery1, im.gallery2, im.gallery3, im.gallery4, im.gallery5, im.gallery6, im.gallery7, im.gallery8 ];
})();
