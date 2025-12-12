document.addEventListener("DOMContentLoaded", function () {
  // Generate starfield
  const starfield = document.querySelector(".sge-starfield");
  if (starfield) {
    const starCount = 200;
    const sizes = ["small", "medium", "large"];
    const sizeWeights = [0.7, 0.25, 0.05]; // Most stars are small
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "sge-star";
      
      // Random weighted size selection
      const rand = Math.random();
      let size;
      if (rand < sizeWeights[0]) {
        size = sizes[0];
      } else if (rand < sizeWeights[0] + sizeWeights[1]) {
        size = sizes[1];
      } else {
        size = sizes[2];
      }
      star.classList.add(`sge-star-${size}`);
      
      // Random twinkle animation
      const twinkle = Math.floor(Math.random() * 3) + 1;
      star.classList.add(`sge-star-twinkle-${twinkle}`);
      
      // Random position across entire viewport
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Random animation delay for natural effect
      star.style.animationDelay = `${Math.random() * 5}s`;
      
      // Slight color variation for some stars (blue/warm tints)
      if (Math.random() > 0.85) {
        const hue = Math.random() > 0.5 ? 220 : 40; // Blue or warm
        star.style.background = `hsl(${hue}, 70%, 80%)`;
      }
      
      starfield.appendChild(star);
    }
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Parallax grid movement
  gsap.to(".sge-grid", {
    xPercent: -25,
    yPercent: -40,
    ease: "none",
    scrollTrigger: {
      trigger: ".sge-scroll-root",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  // Panel reveal animations
  const panels = gsap.utils.toArray(".sge-panel");

  panels.forEach((panel) => {
    const inner = panel.querySelector(".sge-panel-inner");
    if (!inner) return;

    gsap.from(inner, {
      opacity: 0,
      y: 80,
      ease: "none",
      scrollTrigger: {
        trigger: panel,
        start: "top 80%",
        end: "top 30%",
        scrub: true,
      },
    });
  });

  // Plinko scroll-scrub timeline - FULL SCREEN
  const ball = document.querySelector(".sge-plinko-ball");
  if (!ball) return;

  // Get all reveal elements
  const reveal1 = document.querySelector(".sge-reveal-1");
  const reveal2 = document.querySelector(".sge-reveal-2");
  const reveal3 = document.querySelector(".sge-reveal-3");
  const reveal4 = document.querySelector(".sge-reveal-4");
  const reveal5 = document.querySelector(".sge-reveal-5");
  const reveal6 = document.querySelector(".sge-reveal-6");

  // Get all plank elements
  const plank1 = document.querySelector(".sge-plank-1");
  const plank2 = document.querySelector(".sge-plank-2");
  const plank3 = document.querySelector(".sge-plank-3");
  const plank4 = document.querySelector(".sge-plank-4");
  const plank5 = document.querySelector(".sge-plank-5");
  const plank6 = document.querySelector(".sge-plank-6");

  const plinkoTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".sge-scroll-root",
      start: "top top",
      end: "bottom bottom",
      scrub: 8,  // Very slow, scroll reveals
    },
  });

  // Ball bounces across full viewport width
  // Planks fade in very gradually
  
  // Bounce 1
  plinkoTl
    .to(ball, { x: "-35vw", y: "10vh", ease: "power2.inOut", duration: 1 })
    .to(plank1, { opacity: 1, duration: 0.8, ease: "power1.out" }, "<0.4")
    .to(reveal1, { opacity: 1, x: 0, ease: "power2.out", duration: 0.8 }, "<0.2")
    .to(plank1, { opacity: 0, duration: 0.8, ease: "power1.in" }, ">-0.4")
    
  // Bounce 2
    .to(ball, { x: "35vw", y: "25vh", ease: "power2.inOut", duration: 1 })
    .to(plank2, { opacity: 1, duration: 0.8, ease: "power1.out" }, "<0.4")
    .to(reveal1, { opacity: 0, duration: 0.6 }, "<")
    .to(reveal2, { opacity: 1, x: 0, ease: "power2.out", duration: 0.8 }, "<0.2")
    .to(plank2, { opacity: 0, duration: 0.8, ease: "power1.in" }, ">-0.4")
    
  // Bounce 3
    .to(ball, { x: "-30vw", y: "40vh", ease: "power2.inOut", duration: 1 })
    .to(plank3, { opacity: 1, duration: 0.8, ease: "power1.out" }, "<0.4")
    .to(reveal2, { opacity: 0, duration: 0.6 }, "<")
    .to(reveal3, { opacity: 1, x: 0, ease: "power2.out", duration: 0.8 }, "<0.2")
    .to(plank3, { opacity: 0, duration: 0.8, ease: "power1.in" }, ">-0.4")
    
  // Bounce 4
    .to(ball, { x: "30vw", y: "55vh", ease: "power2.inOut", duration: 1 })
    .to(plank4, { opacity: 1, duration: 0.8, ease: "power1.out" }, "<0.4")
    .to(reveal3, { opacity: 0, duration: 0.6 }, "<")
    .to(reveal4, { opacity: 1, x: 0, ease: "power2.out", duration: 0.8 }, "<0.2")
    .to(plank4, { opacity: 0, duration: 0.8, ease: "power1.in" }, ">-0.4")
    
  // Bounce 5
    .to(ball, { x: "-25vw", y: "70vh", ease: "power2.inOut", duration: 1 })
    .to(plank5, { opacity: 1, duration: 0.8, ease: "power1.out" }, "<0.4")
    .to(reveal4, { opacity: 0, duration: 0.6 }, "<")
    .to(reveal5, { opacity: 1, x: 0, ease: "power2.out", duration: 0.8 }, "<0.2")
    .to(plank5, { opacity: 0, duration: 0.8, ease: "power1.in" }, ">-0.4")
    
  // Bounce 6
    .to(ball, { x: "25vw", y: "85vh", ease: "power2.inOut", duration: 1 })
    .to(plank6, { opacity: 1, duration: 0.8, ease: "power1.out" }, "<0.4")
    .to(reveal5, { opacity: 0, duration: 0.6 }, "<")
    .to(reveal6, { opacity: 1, x: 0, ease: "power2.out", duration: 0.8 }, "<0.2")
    .to(plank6, { opacity: 0, duration: 0.8, ease: "power1.in" }, ">-0.4");
});
