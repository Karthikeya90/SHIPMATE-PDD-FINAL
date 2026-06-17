export const manifest: any = {
  screens: {
    scr_gv6ify: { name: "Splash", route: "/splash", position: { "x": 160, "y": 220 } },
    scr_uur6gj: { name: "Landing", route: "/", position: { "x": 1560, "y": 220 } },
    scr_onu4t3: { name: "About", route: "/about", position: { "x": 2960, "y": 220 } },
    scr_943s1w: { name: "Login", route: "/login", position: { "x": 4360, "y": 220 } },
    scr_cx101b: { name: "Signup", route: "/signup", position: { "x": 5760, "y": 220 } },
    scr_pixq3h: { name: "Forgot Password", route: "/forgot-password", position: { "x": 7160, "y": 220 } },
    scr_j9r2ar: { name: "Sender Dashboard", route: "/sender", position: { "x": 160, "y": 2200 } },
    scr_esin82: { name: "Create Request", route: "/sender/create", position: { "x": 1560, "y": 2200 } },
    scr_vw2bid: { name: "Search Travellers", route: "/sender/search", position: { "x": 2960, "y": 2200 } },
    scr_q0yc9c: { name: "Delivery Tracking", route: "/sender/tracking", position: { "x": 4360, "y": 2200 } },
    scr_2o0fpw: { name: "Chat", route: "/sender/chat", position: { "x": 5760, "y": 2200 } },
    scr_8il0pu: { name: "Delivery History", route: "/sender/history", position: { "x": 7160, "y": 2200 } },
    scr_32206m: { name: "Traveller Home", route: "/traveller", position: { "x": 160, "y": 4180 } },
    scr_q1pjl9: { name: "Available Deliveries", route: "/traveller/available", position: { "x": 1560, "y": 4180 } },
    scr_y5pwsg: { name: "Earnings", route: "/traveller/earnings", position: { "x": 2960, "y": 4180 } },
    scr_yqkdss: { name: "Profile", route: "/profile", position: { "x": 160, "y": 6160 } },
    scr_46ku26: { name: "Settings", route: "/settings", position: { "x": 1560, "y": 6160 } }
  },
  sections: {
    sec_y24m0m: { name: "Onboarding & Auth", x: 0, y: 0, width: 8520, height: 1180 },
    sec_vpalf0: { name: "Sender Flow", x: 0, y: 1980, width: 8520, height: 1180 },
    sec_022mwf: { name: "Traveller Flow", x: 0, y: 3960, width: 4320, height: 1180 },
    sec_i7jx3f: { name: "Account & Settings", x: 0, y: 5940, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_y24m0m", children: [
    { kind: "screen", id: "scr_gv6ify" },
    { kind: "screen", id: "scr_uur6gj" },
    { kind: "screen", id: "scr_onu4t3" },
    { kind: "screen", id: "scr_943s1w" },
    { kind: "screen", id: "scr_cx101b" },
    { kind: "screen", id: "scr_pixq3h" }]
  },
  { kind: "section", id: "sec_vpalf0", children: [
    { kind: "screen", id: "scr_j9r2ar" },
    { kind: "screen", id: "scr_esin82" },
    { kind: "screen", id: "scr_vw2bid" },
    { kind: "screen", id: "scr_q0yc9c" },
    { kind: "screen", id: "scr_2o0fpw" },
    { kind: "screen", id: "scr_8il0pu" }]
  },
  { kind: "section", id: "sec_022mwf", children: [
    { kind: "screen", id: "scr_32206m" },
    { kind: "screen", id: "scr_q1pjl9" },
    { kind: "screen", id: "scr_y5pwsg" }]
  },
  { kind: "section", id: "sec_i7jx3f", children: [
    { kind: "screen", id: "scr_yqkdss" },
    { kind: "screen", id: "scr_46ku26" }]
  }]
};
