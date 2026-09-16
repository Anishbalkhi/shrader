export interface ProjectMedia {
  mux_playback_id: string;
}

export interface Project {
  uid: string;
  url: string;
  title: string;
  subtitle: string;
  site_link?: {
    link_type: string;
    key?: string;
    url: string;
    target?: string;
  };
  collaborator?: string;
  mux_playback_id: string;
  brightness?: number;
  contrast?: number;
  project_media: ProjectMedia[];
  description: string;
  tags?: string[];
  year?: string;
}

export const PROJECTS: Project[] = [
  {
    uid: "ehealth-arena",
    url: "/work/ehealth-arena",
    title: "eHealth Arena",
    subtitle: "3D Showroom",
    site_link: {
      link_type: "Web",
      key: "8f9d47f1-e2aa-4c2a-8313-97ef4e38088c",
      url: "https://www.ehealtharena.se/digitalt-showroom",
    },
    collaborator: "Markus Reklambyrå",
    mux_playback_id: "Y7HzOsrmhjd7M00Ib6JYF861ME00I3ZqicLcr4V9vhoXU",
    tags: ["Interactive 3D", "Healthcare", "Digital Showroom"],
    year: "2024",
    project_media: [
      { mux_playback_id: "gyP026f00GygEUVxzl6e4xG1hTvyPyf9DUFTMEok02FvDk" },
      { mux_playback_id: "8jgvDY37uHSMjcWjV59G2hcnBAw01WOs7rbtsid6veoU" },
      { mux_playback_id: "M5WUYh6JnUN454BfB02Q01VfDA4VHCSi7ASLwsQm9Tn1w" },
    ],
    description:
      "We created an interactive 3D platform that explores how the latest e-health solutions work in practice. From the patient's home to hospital environments and care providers' workplaces. Users can follow real care journeys, and understand how it all connects to create safer, more efficient care.",
  },
  {
    uid: "select-concept",
    url: "/work/select-concept",
    title: "Select Concept",
    subtitle: "3D Interior Designer",
    site_link: {
      link_type: "Web",
      key: "b36d87c7-6314-42b9-bc36-5a7fdea19cd4",
      url: "https://selectconcept.com/planner",
      target: "_blank",
    },
    mux_playback_id: "29xq00NijxLTofeMmyr1hvjJjStsZbMzzOBnP8JN24NM",
    brightness: 0.75,
    contrast: 1,
    tags: ["3D Configurator", "E-Commerce", "WebGL"],
    year: "2024",
    project_media: [
      { mux_playback_id: "h344B28uehxF4mUqnTW6tOURAZRB3MJ5r8LRWFo6iEw" },
      { mux_playback_id: "M55yk01Z5rPltnIoTS01025MhFaUHjGO43nCkL2Zi1WLP8" },
      { mux_playback_id: "VOkEARnsJsYOyePubj67h6Us7LtBkdH601M28mKhUWc00" },
    ],
    description:
      "Select Concept is a Swedish brand offering high-quality products for restaurants, hotels and cafes. We teamed up with them to conceptualize, design, and develop a user-friendly yet powerful 3D product planning tool, along with a new website.",
  },
  {
    uid: "gamily",
    url: "/work/gamily",
    title: "Gamily",
    subtitle: "Campaign Website",
    site_link: {
      link_type: "Web",
      key: "00397e67-af16-4030-ac53-ab80fedf9d58",
      url: "https://gamilyapp.com/",
    },
    mux_playback_id: "WR4ERwHNIF5rXY9l026yYwwacbpWgU7q3FrYxKYwqDrY",
    tags: ["Brand Experience", "Gamers App", "Interactive Web"],
    year: "2024",
    project_media: [
      { mux_playback_id: "5WDfnYn02j24uZtRuOWrBqdZs00dGQJIB9JfgLKOLlM6g" },
      { mux_playback_id: "WR4ERwHNIF5rXY9l026yYwwacbpWgU7q3FrYxKYwqDrY" },
      { mux_playback_id: "uzwe1m8025rHS02KDPay7GI85DlCO7PR5v5YC7ebUqDWY" },
      { mux_playback_id: "r3KpNeJPj3ycDd7t1tbufUqYlw007AiXHsDhdbrz62Jo" },
    ],
    description:
      "Gamily is the dating and friend app designed for gamers who are looking for meaningful relationships with fellow gamers.",
  },
  {
    uid: "alamance-foods",
    url: "/work/alamance-foods",
    title: "Alamance Foods",
    subtitle: "Website",
    site_link: {
      link_type: "Web",
      key: "ec61edf3-99da-4471-ba3c-12beb98ac8bb",
      url: "https://www.alamancefoods.com/brands/coffee-toppers",
      target: "_blank",
    },
    mux_playback_id: "crXxuu5ds7W2UrGP1JE00V01xgtotSe02OOUojNBKjprKg",
    brightness: 0.8,
    tags: ["3D Products", "Food & Beverage", "Interactive Web"],
    year: "2024",
    project_media: [
      { mux_playback_id: "crXxuu5ds7W2UrGP1JE00V01xgtotSe02OOUojNBKjprKg" },
      { mux_playback_id: "aimjydu6qzX2HftFtWUqO9Q02uwai7vR02WcU102ARxxws" },
      { mux_playback_id: "lz00yfsd6KGy9SndkMAaQcTIYDKoqhIp8dgyh8R700MqI" },
      { mux_playback_id: "Hwh005XC00jk901GgBSNnaEzOKYa7gaKIyLRkblI8i6yrU" },
    ],
    description:
      "Alamance Foods make fun foods. We made their web page using creative design ideas complemented with their products in 3D.",
  },
  {
    uid: "son",
    url: "/work/son",
    title: "Norrköpings Symfoniorkester",
    subtitle: "Website",
    site_link: {
      link_type: "Web",
      key: "88d6ce36-11b1-4484-b075-6852bc9133f5",
      url: "https://www.norrkopingssymfoniorkester.se/",
      target: "_blank",
    },
    mux_playback_id: "hrfPaZr4FOpHh2iiUzTz01ppZApstkbjMH01vyZ5bDEg8",
    tags: ["Culture", "Ticketing Platform", "Scenkonst Öst"],
    year: "2023",
    project_media: [
      { mux_playback_id: "XGZPxx01Di01mSOSTZc7r01Kn2H8RN9rbrUqnwX01snmeFw" },
      { mux_playback_id: "qqHoqRFJmREhhYB6fBnB02rYbtgmZT7KccPYswBfLe0200" },
      { mux_playback_id: "tOwPdRvWzCrqBATUIOo7q6KEYeDy8ZAc5L11Gil8EAc" },
      { mux_playback_id: "ps02qxHI6qgHOmnhVwS00y4u13m01R1i00YUOLRDBQQRqsY" },
    ],
    description:
      "We manage the entire web platform for Scenkonst Öst where Norrköping Symphony Orchestra is a part. The audience can browse concerts, book tickets, buy gift cards and much more.",
  },
  {
    uid: "glasbolaget",
    url: "/work/glasbolaget",
    title: "Glasbolaget",
    subtitle: "3D Configurator",
    site_link: {
      link_type: "Web",
      key: "4c47b1e0-c88a-4a2b-b11c-07b41503d86b",
      url: "https://glasbolaget-configurator.vercel.app/",
      target: "_blank",
    },
    mux_playback_id: "cUnrcyhPVk47A500005QHTfK00wUyr201vc2NEORq5ybaCE",
    brightness: 0.75,
    tags: ["Parametric 3D", "Real-Time Pricing", "WebGL Configurator"],
    year: "2023",
    project_media: [
      { mux_playback_id: "bYuaivFc7Q6eVLBdcX31KAeqnsgluc7yFXchTIKHHdc" },
      { mux_playback_id: "whhI01nHb1V02BeO43Ax92AMwXXPAp1yQ01vkW1ZvL5cpM" },
      { mux_playback_id: "79yry93M01MVaxHIFuCLYEeFowTkMkIdnrTEiex00XM01Q" },
    ],
    description:
      "We made a configurator for a company that sells glass in different forms. The user can create their own glass rails, walls and separate pieces using our 3D configurator. The prices are being fetched from an API so that we can calculate the total cost as the user designs.",
  },
  {
    uid: "spp-dream-generator",
    url: "/work/spp-dream-generator",
    title: "SPP Dream Generator",
    subtitle: "AI Image and Video Generator",
    site_link: {
      link_type: "Web",
      key: "3e769d7f-3811-40a4-878f-8699b42aa2fc",
      url: "https://retirement-dream-generator.se",
    },
    collaborator: "Jungle Design",
    mux_playback_id: "JFKPwSwJdrTK6zn1c013dCw5HTxkekifCD8cbWWmd7JQ",
    brightness: 0.8,
    tags: ["Generative AI", "Image & Video", "PR Campaign"],
    year: "2023",
    project_media: [
      { mux_playback_id: "uzBOoiGvXfxdOASlVqDU005foqLExaLY7482szwaUo8g" },
      { mux_playback_id: "H3BBktaN1wLTt5hcjLU00FxM7X500cS602pwInC00FxfRVg" },
      { mux_playback_id: "cOKCARGGC6Te2RzXstxln4fDWP8vSK8eTvx1eZAvp6w" },
      { mux_playback_id: "JCuoog00nHzvxcJzE02aqG9Z1l8lyq2JJzY201e5n3Dy1c" },
    ],
    description:
      "What was supposed to be a one shot PR event became a lasting piece of the SPP website. The visitor takes a photo of him/herself and writes a short description of what the days would look like when retired from work.",
  },
  {
    uid: "ica-nissen",
    url: "/work/ica-nissen",
    title: "ICA-nissen",
    subtitle: "AR Game",
    collaborator: "Wenderfalck",
    mux_playback_id: "caSLneThURyYn402mCTXi6sgHLpL2F0201EcF01rI3ZwKk8",
    brightness: 0.7,
    tags: ["Augmented Reality", "Retail", "Mobile Web"],
    year: "2024",
    project_media: [
      { mux_playback_id: "5ySYfYF02sqCtkV8vy009HS1z1vPP7pBKB3zYDaWDI6Us" },
      { mux_playback_id: "wPWOmus01QZjlNL6YYFXj1Z1NWkk8TOBMJdLLsEQKg44" },
      { mux_playback_id: "AJkkMkHOt6xQsgOxpQa6j2nvIOhvtejYFs6SU3aAgJs" },
      { mux_playback_id: "01vZOcXfUrPvKGOILFcwB7lhhH5DBTwY006m3tgeRGjJA" },
      { mux_playback_id: "bb02O7nwwDJ3wG5Ksr02Hs01xrETmBlkeeaEY4YyTq3ArY" },
      { mux_playback_id: "caSLneThURyYn402mCTXi6sgHLpL2F0201EcF01rI3ZwKk8" },
    ],
    description:
      "ICA is one of Sweden's largest grocery stores. For Christmas 2024 we made an AR game for them where users could scan ICA's products and unlock features in the game.",
  },
  {
    uid: "norrkopings-hamn",
    url: "/work/norrkopings-hamn",
    title: "Norrköpings Hamn",
    subtitle: "3D Flow Visualization",
    site_link: {
      link_type: "Web",
      key: "bdde7ff1-2a65-43be-b43d-eab82d7c4ca2",
      url: "https://visual-of-sweden.vercel.app/hamnen",
    },
    mux_playback_id: "byyZFSODgpXF2dwVzYl1sLBSfpwUw4mHYhWiqT3qRZ4",
    brightness: 0.75,
    tags: ["Data Visualization", "Logistics", "Real-Time 3D"],
    year: "2023",
    project_media: [
      { mux_playback_id: "7xt9X00JO5m9YJ301iOaLnXJHI801GbA8FKWNr001OjRbFw" },
      { mux_playback_id: "sheOFcp9fDYsGRNko802zE9bONvR011Zx83kXkwQe65XY" },
      { mux_playback_id: "UTKAQh00009GaGixHM8QJTZnda8qIdPaggG4FKiGiaJGA" },
      { mux_playback_id: "c6bE7jLrDuM4ZwPU6GRcUmLeIM013zS3Q2eQnjRY6L3o" },
      { mux_playback_id: "dJA1iG1fPVw3hPcXxwVacVOlPmx6J4jbpjaHNg5deHE" },
      { mux_playback_id: "T4YRKbtsXNqDZxgpwDc87V02eVkiTXwzk5Jo01MEFz01E00" },
    ],
    description:
      "We created a real-time 3D visual experience detailing the physical journey and logistics of two shipping containers. The objective of this application was to provide users with a detailed and engaging insight into the complex operations conducted at the docks of Norrköping.",
  },
  {
    uid: "heip",
    url: "/work/heip",
    title: "HEIP",
    subtitle: "3D Visualisation",
    site_link: {
      link_type: "Web",
      key: "eaf9d153-1e08-411d-baa7-42d01240e236",
      url: "https://heip-vis.vercel.app/sv",
      target: "_blank",
    },
    mux_playback_id: "LbdE02DF9Gx1iVtxU98nv6uOtEEmQkTSs00Uyqb6O0201Tw",
    tags: ["Industrial Ecology", "Circular Economy", "3D Web"],
    year: "2023",
    project_media: [
      { mux_playback_id: "LbdE02DF9Gx1iVtxU98nv6uOtEEmQkTSs00Uyqb6O0201Tw" },
      { mux_playback_id: "mAHI2XHR02R49Q02ZTknqKi4JmkIkHeUPrsQ0200101MFFKE" },
      { mux_playback_id: "005QKAjn5uzXCECW6eQSaNXX01LLEIBg6rT3P6nySuJL4" },
    ],
    description:
      "This visualization was created for Händelö Eco-Industrial Park and shows how different factories and units exchange by-products, reducing waste and maximizing overall efficiency.",
  },
  {
    uid: "design-is-funny",
    url: "/work/design-is-funny",
    title: "Design is Funny",
    subtitle: "Portfolio",
    site_link: {
      link_type: "Web",
      key: "4142da15-061b-41b1-a64b-2bb6b237518d",
      url: "https://www.designisfunny.co/",
    },
    collaborator: "Daniele Buffa",
    mux_playback_id: "83n4y2fZh2ztnRDEkkHBr2CxcTt9ofYGNL601sy9bpW00",
    brightness: 1,
    contrast: 1,
    tags: ["Award-Winning", "Design Portfolio", "Micro-Interactions"],
    year: "2024",
    project_media: [
      { mux_playback_id: "013qxnkYrVxEnqwseKxlEb11Cad02z02BJLjOhQdz01v02nk" },
      { mux_playback_id: "vV1lkODuGFp00ahFD8D5PxuFwMyf01M4ZaZ02934yL3ya00" },
      { mux_playback_id: "00gwM2OvfPxE1LB73lvkkQdiJ7Dfi01ciEIadSGYSW2do" },
    ],
    description:
      "Funny is the design work of Daniele Buffa, a Roman designer now based in London, UK. Buffa ('boo-f:ah) from the Italian means funny, comic, or droll.",
  },
];
