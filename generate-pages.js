'use strict';
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

const TZ_DEFS = {
  nz:        { label: 'New Zealand',  ianaZone: 'Pacific/Auckland',  short: 'NZT'  },
  australia: { label: 'Australia',    ianaZone: 'Australia/Sydney',  short: 'AEDT' },
  uk:        { label: 'UK',           ianaZone: 'Europe/London',     short: 'BST'  },
  india:     { label: 'India',        ianaZone: 'Asia/Kolkata',      short: 'IST'  },
  us:        { label: 'US (Eastern)', ianaZone: 'America/New_York',  short: 'ET'   },
};

const EVENTS_LIST = [
  // F1
  { slugs:['when-is-next-f1-race'], name:'Next F1 Race — Canadian Grand Prix', sport:'F1', icon:'🏎️', startUtc:'2026-05-24T20:00:00Z', venue:'Circuit Gilles Villeneuve, Montreal', subtitle:'Formula 1 2026 · Round 5', desc:'Find out exactly when the next Formula 1 race starts in {tz}. Live countdown for the 2026 Canadian Grand Prix.' },
  { slugs:['when-is-monaco-grand-prix-2026','when-is-monaco-grand-prix'], name:'Monaco Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-06-07T13:00:00Z', venue:'Circuit de Monaco, Monte Carlo', subtitle:'Formula 1 2026 · Round 6', desc:'When is the Monaco Grand Prix 2026 in {tz}? Get the exact local start time and live countdown.' },
  { slugs:['when-is-spanish-grand-prix-2026','when-is-spanish-grand-prix'], name:'Spanish Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-06-14T13:00:00Z', venue:'Circuit de Barcelona-Catalunya', subtitle:'Formula 1 2026 · Round 7', desc:'When is the Spanish Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-canadian-grand-prix-2026','when-is-canadian-grand-prix'], name:'Canadian Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-05-24T20:00:00Z', venue:'Circuit Gilles Villeneuve, Montreal', subtitle:'Formula 1 2026 · Round 5', desc:'When is the Canadian Grand Prix 2026 in {tz}? Get the exact local start time and live countdown.' },
  { slugs:['when-is-austrian-grand-prix-2026','when-is-austrian-grand-prix'], name:'Austrian Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-06-28T13:00:00Z', venue:'Red Bull Ring, Spielberg', subtitle:'Formula 1 2026 · Round 8', desc:'When is the Austrian Grand Prix 2026 in {tz}? Live countdown and exact local start time.' },
  { slugs:['when-is-british-grand-prix-2026','when-is-british-grand-prix'], name:'British Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-07-05T14:00:00Z', venue:'Silverstone Circuit, Northamptonshire', subtitle:'Formula 1 2026 · Round 9', desc:'When is the British Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-belgian-grand-prix-2026','when-is-belgian-grand-prix'], name:'Belgian Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-07-19T13:00:00Z', venue:'Circuit de Spa-Francorchamps', subtitle:'Formula 1 2026 · Round 10', desc:'When is the Belgian Grand Prix 2026 in {tz}? Live countdown and exact local start time.' },
  { slugs:['when-is-hungarian-grand-prix-2026','when-is-hungarian-grand-prix'], name:'Hungarian Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-07-26T13:00:00Z', venue:'Hungaroring, Budapest', subtitle:'Formula 1 2026 · Round 11', desc:'When is the Hungarian Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-dutch-grand-prix-2026','when-is-dutch-grand-prix'], name:'Dutch Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-08-23T13:00:00Z', venue:'Circuit Zandvoort, Netherlands', subtitle:'Formula 1 2026 · Round 12', desc:'When is the Dutch Grand Prix 2026 in {tz}? Live countdown and exact local time.' },
  { slugs:['when-is-italian-grand-prix-2026','when-is-italian-grand-prix'], name:'Italian Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-09-06T13:00:00Z', venue:'Autodromo Nazionale Monza', subtitle:'Formula 1 2026 · Round 13', desc:'When is the Italian Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-singapore-grand-prix-2026','when-is-singapore-grand-prix'], name:'Singapore Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-09-20T09:00:00Z', venue:'Marina Bay Street Circuit, Singapore', subtitle:'Formula 1 2026 · Singapore Grand Prix', desc:'When is the Singapore Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-us-grand-prix-2026','when-is-us-grand-prix'], name:'United States Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-10-18T19:00:00Z', venue:'Circuit of the Americas, Austin TX', subtitle:'Formula 1 2026 · US Grand Prix', desc:'When is the US Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-mexico-grand-prix-2026','when-is-mexico-grand-prix'], name:'Mexico City Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-10-25T20:00:00Z', venue:'Autodromo Hermanos Rodriguez, Mexico City', subtitle:'Formula 1 2026 · Mexico City Grand Prix', desc:'When is the Mexico City Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-brazilian-grand-prix-2026','when-is-brazilian-grand-prix'], name:'Brazilian Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-11-08T18:00:00Z', venue:'Autodromo Interlagos, Sao Paulo', subtitle:'Formula 1 2026 · Brazilian Grand Prix', desc:'When is the Brazilian Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-las-vegas-grand-prix-2026','when-is-las-vegas-grand-prix'], name:'Las Vegas Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-11-22T06:00:00Z', venue:'Las Vegas Strip Circuit, Las Vegas', subtitle:'Formula 1 2026 · Las Vegas Grand Prix', desc:'When is the Las Vegas Grand Prix 2026 in {tz}? Midnight race — get the exact local time and live countdown.' },
  { slugs:['when-is-qatar-grand-prix-2026','when-is-qatar-grand-prix'], name:'Qatar Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-11-29T14:00:00Z', venue:'Lusail International Circuit, Lusail', subtitle:'Formula 1 2026 · Qatar Grand Prix', desc:'When is the Qatar Grand Prix 2026 in {tz}? Live countdown and local start time.' },
  { slugs:['when-is-abu-dhabi-grand-prix-2026','when-is-abu-dhabi-grand-prix'], name:'Abu Dhabi Grand Prix 2026', sport:'F1', icon:'🏎️', startUtc:'2026-12-06T13:00:00Z', venue:'Yas Marina Circuit, Abu Dhabi', subtitle:'Formula 1 2026 · Season Finale', desc:'When is the Abu Dhabi Grand Prix 2026 in {tz}? Season finale — live countdown and local start time.' },

  // World Cup overview
  { slugs:['when-is-fifa-world-cup-2026'], name:'FIFA World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-11T19:00:00Z', venue:'USA, Canada & Mexico', subtitle:'FIFA World Cup 2026 · June 11 – July 19', desc:'When is the FIFA World Cup 2026 in {tz}? Opening match times, full schedule and live countdown.' },
  { slugs:['when-is-world-cup-2026-first-game','when-is-world-cup-2026-opening-match'], name:'World Cup 2026 — Opening Match', sport:'World Cup', icon:'🏆', startUtc:'2026-06-11T19:00:00Z', venue:'Estadio Azteca, Mexico City', subtitle:'FIFA World Cup 2026 · Opening Match · Group A', desc:'When is the first game of the World Cup 2026 in {tz}? Mexico vs South Africa opens the tournament at Estadio Azteca.' },

  // Group G
  { slugs:['when-is-iran-vs-new-zealand-world-cup-2026'], name:'Iran vs New Zealand — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-16T01:00:00Z', venue:'SoFi Stadium, Los Angeles', subtitle:'FIFA World Cup 2026 · Group G', desc:'When is Iran vs New Zealand at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-belgium-vs-new-zealand-world-cup-2026'], name:'Belgium vs New Zealand — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-21T22:00:00Z', venue:'BC Place, Vancouver', subtitle:'FIFA World Cup 2026 · Group G', desc:'When is Belgium vs New Zealand at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-new-zealand-vs-egypt-world-cup-2026'], name:'New Zealand vs Egypt — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-22T01:00:00Z', venue:'BC Place, Vancouver', subtitle:'FIFA World Cup 2026 · Group G', desc:'When is New Zealand vs Egypt at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-new-zealand-world-cup-2026-game'], name:"New Zealand's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-16T01:00:00Z', venue:'SoFi Stadium, Los Angeles', subtitle:'FIFA World Cup 2026 · Group G · First game: Iran vs NZ', desc:"When are New Zealand's World Cup 2026 games in {tz}? All All Whites kick-off times with live countdown." },
  { slugs:['when-is-belgium-vs-iran-world-cup-2026'], name:'Belgium vs Iran — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-21T19:00:00Z', venue:'SoFi Stadium, Los Angeles', subtitle:'FIFA World Cup 2026 · Group G', desc:'When is Belgium vs Iran at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-belgium-vs-egypt-world-cup-2026'], name:'Belgium vs Egypt — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-15T19:00:00Z', venue:'Lumen Field, Seattle', subtitle:'FIFA World Cup 2026 · Group G', desc:'When is Belgium vs Egypt at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-egypt-vs-iran-world-cup-2026'], name:'Egypt vs Iran — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-26T22:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group G', desc:'When is Egypt vs Iran at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },

  // Group D
  { slugs:['when-is-usa-vs-australia-world-cup-2026'], name:'USA vs Australia — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-19T19:00:00Z', venue:'Lumen Field, Seattle', subtitle:'FIFA World Cup 2026 · Group D', desc:'When is USA vs Australia at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-australia-vs-turkey-world-cup-2026'], name:'Australia vs Turkiye — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-13T04:00:00Z', venue:'BC Place, Vancouver', subtitle:'FIFA World Cup 2026 · Group D', desc:'When is Australia vs Turkiye at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-australia-vs-paraguay-world-cup-2026'], name:'Australia vs Paraguay — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-25T22:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group D', desc:'When is Australia vs Paraguay at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-australia-world-cup-2026-game'], name:"Australia's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-13T04:00:00Z', venue:'BC Place, Vancouver', subtitle:'FIFA World Cup 2026 · Group D · First game: Australia vs Turkiye', desc:"When are Australia's World Cup 2026 games in {tz}? All Socceroos kick-off times with live countdown." },
  { slugs:['when-is-usa-vs-paraguay-world-cup-2026'], name:'USA vs Paraguay — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-13T01:00:00Z', venue:'SoFi Stadium, Los Angeles', subtitle:'FIFA World Cup 2026 · Group D', desc:'When is USA vs Paraguay at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-usa-vs-turkey-world-cup-2026'], name:'USA vs Turkiye — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-20T03:00:00Z', venue:"Levi's Stadium, Santa Clara CA", subtitle:'FIFA World Cup 2026 · Group D', desc:'When is USA vs Turkiye at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-usa-world-cup-2026-game'], name:"USA's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-13T01:00:00Z', venue:'SoFi Stadium, Los Angeles', subtitle:'FIFA World Cup 2026 · Group D · First game: USA vs Paraguay', desc:"When are the USA's World Cup 2026 games in {tz}? All USMNT kick-off times with live countdown." },

  // Group C
  { slugs:['when-is-brazil-vs-morocco-world-cup-2026'], name:'Brazil vs Morocco — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-13T22:00:00Z', venue:'MetLife Stadium, New York', subtitle:'FIFA World Cup 2026 · Group C', desc:'When is Brazil vs Morocco at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-brazil-vs-scotland-world-cup-2026'], name:'Brazil vs Scotland — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-20T22:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group C', desc:'When is Brazil vs Scotland at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-brazil-vs-haiti-world-cup-2026'], name:'Brazil vs Haiti — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-20T00:30:00Z', venue:'Lincoln Financial Field, Philadelphia', subtitle:'FIFA World Cup 2026 · Group C', desc:'When is Brazil vs Haiti at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-brazil-world-cup-2026-game'], name:"Brazil's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-13T22:00:00Z', venue:'MetLife Stadium, New York', subtitle:'FIFA World Cup 2026 · Group C · First game: Brazil vs Morocco', desc:"When are Brazil's World Cup 2026 games in {tz}? All Selecao kick-off times with live countdown." },
  { slugs:['when-is-scotland-vs-morocco-world-cup-2026'], name:'Scotland vs Morocco — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-19T22:00:00Z', venue:'Gillette Stadium, Boston', subtitle:'FIFA World Cup 2026 · Group C', desc:'When is Scotland vs Morocco at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },

  // Group J — Argentina
  { slugs:['when-is-argentina-vs-algeria-world-cup-2026'], name:'Argentina vs Algeria — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-17T23:00:00Z', venue:'AT&T Stadium, Dallas', subtitle:'FIFA World Cup 2026 · Group J', desc:'When is Argentina vs Algeria at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-argentina-vs-austria-world-cup-2026'], name:'Argentina vs Austria — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-23T22:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group J', desc:'When is Argentina vs Austria at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-argentina-vs-jordan-world-cup-2026'], name:'Argentina vs Jordan — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-27T01:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group J', desc:'When is Argentina vs Jordan at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-argentina-world-cup-2026-game'], name:"Argentina's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-17T23:00:00Z', venue:'AT&T Stadium, Dallas', subtitle:'FIFA World Cup 2026 · Group J · First game: Argentina vs Algeria', desc:"When are Argentina's World Cup 2026 games in {tz}? All La Albiceleste kick-off times with live countdown." },

  // Group L — England
  { slugs:['when-is-england-vs-croatia-world-cup-2026'], name:'England vs Croatia — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-18T23:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group L', desc:'When is England vs Croatia at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-england-vs-ghana-world-cup-2026'], name:'England vs Ghana — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-24T22:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group L', desc:'When is England vs Ghana at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-england-vs-panama-world-cup-2026'], name:'England vs Panama — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-28T19:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group L', desc:'When is England vs Panama at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-england-world-cup-2026-game'], name:"England's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-18T23:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group L', desc:"When are England's World Cup 2026 games in {tz}? All Three Lions kick-off times with live countdown." },

  // Group I — France
  { slugs:['when-is-france-vs-senegal-world-cup-2026'], name:'France vs Senegal — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-16T19:00:00Z', venue:'MetLife Stadium, New York', subtitle:'FIFA World Cup 2026 · Group I', desc:'When is France vs Senegal at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-france-vs-norway-world-cup-2026'], name:'France vs Norway — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-22T19:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group I', desc:'When is France vs Norway at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-france-vs-iraq-world-cup-2026'], name:'France vs Iraq — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-27T19:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group I', desc:'When is France vs Iraq at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-france-world-cup-2026-game'], name:"France's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-16T19:00:00Z', venue:'MetLife Stadium, New York', subtitle:'FIFA World Cup 2026 · Group I · First game: France vs Senegal', desc:"When are France's World Cup 2026 games in {tz}? All Les Bleus kick-off times with live countdown." },

  // Group E — Germany
  { slugs:['when-is-germany-vs-ivory-coast-world-cup-2026'], name:'Germany vs Ivory Coast — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-14T23:00:00Z', venue:'NRG Stadium, Houston', subtitle:'FIFA World Cup 2026 · Group E', desc:'When is Germany vs Ivory Coast at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-germany-vs-ecuador-world-cup-2026'], name:'Germany vs Ecuador — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-20T19:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group E', desc:'When is Germany vs Ecuador at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-germany-vs-curacao-world-cup-2026'], name:'Germany vs Curacao — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-14T17:00:00Z', venue:'NRG Stadium, Houston', subtitle:'FIFA World Cup 2026 · Group E', desc:'When is Germany vs Curacao at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-germany-world-cup-2026-game'], name:"Germany's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-14T17:00:00Z', venue:'NRG Stadium, Houston', subtitle:'FIFA World Cup 2026 · Group E · First game: Germany vs Curacao', desc:"When are Germany's World Cup 2026 games in {tz}? All Die Mannschaft kick-off times with live countdown." },

  // Group A — Mexico
  { slugs:['when-is-mexico-vs-south-africa-world-cup-2026'], name:'Mexico vs South Africa — World Cup 2026 Opening', sport:'World Cup', icon:'🏆', startUtc:'2026-06-11T19:00:00Z', venue:'Estadio Azteca, Mexico City', subtitle:'FIFA World Cup 2026 · Opening Match · Group A', desc:'When is Mexico vs South Africa (Opening Match) at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-mexico-vs-south-korea-world-cup-2026'], name:'Mexico vs South Korea — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-19T01:00:00Z', venue:'Estadio Akron, Guadalajara', subtitle:'FIFA World Cup 2026 · Group A', desc:'When is Mexico vs South Korea at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-mexico-vs-czechia-world-cup-2026'], name:'Mexico vs Czechia — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-25T01:00:00Z', venue:'Estadio Azteca, Mexico City', subtitle:'FIFA World Cup 2026 · Group A', desc:'When is Mexico vs Czechia at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-mexico-world-cup-2026-game'], name:"Mexico's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-11T19:00:00Z', venue:'Estadio Azteca, Mexico City', subtitle:'FIFA World Cup 2026 · Group A · Opening Match', desc:"When are Mexico's World Cup 2026 games in {tz}? El Tri play in the opening match! All kick-off times with countdown." },

  // Group B — Canada
  { slugs:['when-is-canada-vs-bosnia-world-cup-2026'], name:'Canada vs Bosnia & Herzegovina — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-12T19:00:00Z', venue:'BMO Field, Toronto', subtitle:'FIFA World Cup 2026 · Group B', desc:'When is Canada vs Bosnia & Herzegovina at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-canada-world-cup-2026-game'], name:"Canada's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-12T19:00:00Z', venue:'BMO Field, Toronto', subtitle:'FIFA World Cup 2026 · Group B · First game: Canada vs Bosnia', desc:"When are Canada's World Cup 2026 games in {tz}? The Canucks play on home soil! All kick-off times with countdown." },

  // Group H — Spain
  { slugs:['when-is-spain-vs-uruguay-world-cup-2026'], name:'Spain vs Uruguay — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-22T16:00:00Z', venue:'Various Venue, USA', subtitle:'FIFA World Cup 2026 · Group H', desc:'When is Spain vs Uruguay at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-spain-vs-saudi-arabia-world-cup-2026'], name:'Spain vs Saudi Arabia — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-15T22:00:00Z', venue:'Hard Rock Stadium, Miami', subtitle:'FIFA World Cup 2026 · Group H', desc:'When is Spain vs Saudi Arabia at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-spain-world-cup-2026-game'], name:"Spain's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-15T16:00:00Z', venue:'Mercedes-Benz Stadium, Atlanta', subtitle:'FIFA World Cup 2026 · Group H · First game: Spain vs Cape Verde', desc:"When are Spain's World Cup 2026 games in {tz}? All La Roja kick-off times with live countdown." },

  // Group F
  { slugs:['when-is-netherlands-vs-japan-world-cup-2026'], name:'Netherlands vs Japan — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-14T20:00:00Z', venue:'AT&T Stadium, Dallas', subtitle:'FIFA World Cup 2026 · Group F', desc:'When is Netherlands vs Japan at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-japan-world-cup-2026-game'], name:"Japan's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-14T20:00:00Z', venue:'AT&T Stadium, Dallas', subtitle:'FIFA World Cup 2026 · Group F · First game: Netherlands vs Japan', desc:"When are Japan's World Cup 2026 games in {tz}? All Samurai Blue kick-off times with live countdown." },

  // Group K — Portugal
  { slugs:['when-is-portugal-vs-colombia-world-cup-2026'], name:'Portugal vs Colombia — World Cup 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-06-17T22:00:00Z', venue:'Hard Rock Stadium, Miami', subtitle:'FIFA World Cup 2026 · Group K', desc:'When is Portugal vs Colombia at the World Cup 2026 in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-portugal-world-cup-2026-game'], name:"Portugal's World Cup 2026 Matches", sport:'World Cup', icon:'🏆', startUtc:'2026-06-17T22:00:00Z', venue:'Hard Rock Stadium, Miami', subtitle:'FIFA World Cup 2026 · Group K', desc:"When are Portugal's World Cup 2026 games in {tz}? All kick-off times with live countdown." },

  // Knockout
  { slugs:['when-is-world-cup-2026-round-of-32'], name:'World Cup 2026 — Round of 32', sport:'World Cup', icon:'🏆', startUtc:'2026-06-28T19:00:00Z', venue:'Various venues, USA/Canada/Mexico', subtitle:'FIFA World Cup 2026 · Round of 32', desc:'When is the World Cup 2026 Round of 32 in {tz}? Knockout stage kick-off times and live countdown.' },
  { slugs:['when-is-world-cup-2026-round-of-16'], name:'World Cup 2026 — Round of 16', sport:'World Cup', icon:'🏆', startUtc:'2026-07-04T19:00:00Z', venue:'Various venues, USA', subtitle:'FIFA World Cup 2026 · Round of 16', desc:'When is the World Cup 2026 Round of 16 in {tz}? Kick-off times and live countdown.' },
  { slugs:['when-is-world-cup-2026-quarter-final'], name:'World Cup 2026 — Quarter-Finals', sport:'World Cup', icon:'🏆', startUtc:'2026-07-09T23:00:00Z', venue:'AT&T Stadium, Dallas / MetLife Stadium, New York', subtitle:'FIFA World Cup 2026 · Quarter-Finals', desc:'When is the World Cup 2026 Quarter-Final in {tz}? Kick-off times and live countdown.' },
  { slugs:['when-is-world-cup-2026-semi-final'], name:'World Cup 2026 — Semi-Finals', sport:'World Cup', icon:'🏆', startUtc:'2026-07-14T23:00:00Z', venue:'MetLife Stadium, New York', subtitle:'FIFA World Cup 2026 · Semi-Finals', desc:'When is the World Cup 2026 Semi-Final in {tz}? Kick-off time and live countdown.' },
  { slugs:['when-is-world-cup-final-2026'], name:'FIFA World Cup Final 2026', sport:'World Cup', icon:'🏆', startUtc:'2026-07-19T20:00:00Z', venue:'MetLife Stadium, New York', subtitle:'FIFA World Cup 2026 · THE FINAL', desc:'When is the FIFA World Cup Final 2026 in {tz}? Exact kick-off time and live countdown for the biggest game on Earth.' },

  // NBA
  { slugs:['when-is-nba-finals-2026'], name:'NBA Finals 2026', sport:'NBA', icon:'🏀', startUtc:'2026-06-05T00:30:00Z', venue:'TBD — Higher seed home court', subtitle:'NBA Playoffs 2026 · The Finals', desc:'When is the NBA Finals 2026 in {tz}? Game 1 tip-off time and schedule with live countdown.' },
  { slugs:['when-is-nba-finals-game-1'], name:'NBA Finals 2026 — Game 1', sport:'NBA', icon:'🏀', startUtc:'2026-06-05T00:30:00Z', venue:'TBD — Higher seed home court', subtitle:'NBA Finals 2026 · Game 1', desc:'When is NBA Finals Game 1 in {tz}? Exact tip-off time and live countdown.' },
  { slugs:['when-is-nba-conference-finals-2026'], name:'NBA Conference Finals 2026', sport:'NBA', icon:'🏀', startUtc:'2026-05-19T00:30:00Z', venue:'TBD', subtitle:'NBA Playoffs 2026 · Conference Finals', desc:'When is the NBA Conference Finals 2026 in {tz}? Tip-off time and live countdown.' },
  { slugs:['when-is-celtics-vs-pacers-nba-2026'], name:'Celtics vs Pacers — NBA Playoffs 2026', sport:'NBA', icon:'🏀', startUtc:'2026-05-19T00:30:00Z', venue:'TD Garden, Boston', subtitle:'NBA Playoffs 2026 · Conference Finals', desc:'When is Celtics vs Pacers in {tz}? Exact tip-off time and live countdown.' },
  { slugs:['when-is-thunder-vs-nuggets-nba-2026'], name:'Thunder vs Nuggets — NBA Playoffs 2026', sport:'NBA', icon:'🏀', startUtc:'2026-05-20T02:30:00Z', venue:'Paycom Center, Oklahoma City', subtitle:'NBA Playoffs 2026 · Conference Finals', desc:'When is Thunder vs Nuggets in {tz}? Exact tip-off time and live countdown.' },
  { slugs:['when-is-next-nba-game'], name:'Next NBA Game', sport:'NBA', icon:'🏀', startUtc:'2026-05-19T00:30:00Z', venue:'TBD', subtitle:'NBA Playoffs 2026', desc:'When is the next NBA game in {tz}? Exact tip-off time and live countdown.' },

  // NHL
  { slugs:['when-is-stanley-cup-final-2026'], name:'Stanley Cup Final 2026', sport:'NHL', icon:'🏒', startUtc:'2026-06-02T23:00:00Z', venue:'TBD — Higher seed home ice', subtitle:'NHL Playoffs 2026 · Stanley Cup Final', desc:'When is the Stanley Cup Final 2026 in {tz}? Game 1 puck drop and schedule with live countdown.' },
  { slugs:['when-is-stanley-cup-game-1'], name:'Stanley Cup Final 2026 — Game 1', sport:'NHL', icon:'🏒', startUtc:'2026-06-02T23:00:00Z', venue:'TBD — Higher seed home ice', subtitle:'NHL Playoffs 2026 · Stanley Cup Final', desc:'When is Stanley Cup Final Game 1 in {tz}? Exact puck drop time and live countdown.' },
  { slugs:['when-is-nhl-conference-finals-2026'], name:'NHL Conference Finals 2026', sport:'NHL', icon:'🏒', startUtc:'2026-05-19T23:00:00Z', venue:'TBD', subtitle:'NHL Playoffs 2026 · Conference Finals', desc:'When is the NHL Conference Finals 2026 in {tz}? Puck drop time and live countdown.' },
  { slugs:['when-is-maple-leafs-vs-hurricanes-nhl-2026'], name:'Maple Leafs vs Hurricanes — NHL Playoffs 2026', sport:'NHL', icon:'🏒', startUtc:'2026-05-19T23:00:00Z', venue:'Scotiabank Arena, Toronto', subtitle:'NHL Playoffs 2026 · Conference Finals', desc:'When is Maple Leafs vs Hurricanes in {tz}? Exact puck drop time and live countdown.' },
  { slugs:['when-is-oilers-vs-stars-nhl-2026'], name:'Oilers vs Stars — NHL Playoffs 2026', sport:'NHL', icon:'🏒', startUtc:'2026-05-20T01:30:00Z', venue:'Rogers Place, Edmonton', subtitle:'NHL Playoffs 2026 · Conference Finals', desc:'When is Oilers vs Stars in {tz}? Exact puck drop time and live countdown.' },
  { slugs:['when-is-next-nhl-game'], name:'Next NHL Game', sport:'NHL', icon:'🏒', startUtc:'2026-05-19T23:00:00Z', venue:'TBD', subtitle:'NHL Playoffs 2026', desc:'When is the next NHL game in {tz}? Exact puck drop time and live countdown.' },

  // MLB
  { slugs:['when-is-yankees-vs-red-sox-2026'], name:'Yankees vs Red Sox 2026', sport:'MLB', icon:'⚾', startUtc:'2026-05-22T23:10:00Z', venue:'Yankee Stadium, New York', subtitle:'MLB 2026 · AL East Rivalry', desc:'When is Yankees vs Red Sox in {tz}? Exact first pitch time and live countdown.' },
  { slugs:['when-is-dodgers-vs-giants-2026'], name:'Dodgers vs Giants 2026', sport:'MLB', icon:'⚾', startUtc:'2026-05-23T02:10:00Z', venue:'Dodger Stadium, Los Angeles', subtitle:'MLB 2026 · NL West Rivalry', desc:'When is Dodgers vs Giants in {tz}? Exact first pitch time and live countdown.' },
  { slugs:['when-is-cubs-vs-cardinals-2026'], name:'Cubs vs Cardinals 2026', sport:'MLB', icon:'⚾', startUtc:'2026-05-22T17:20:00Z', venue:'Wrigley Field, Chicago', subtitle:'MLB 2026 · NL Central Rivalry', desc:'When is Cubs vs Cardinals in {tz}? Exact first pitch time and live countdown.' },
  { slugs:['when-is-mets-vs-yankees-2026'], name:'Mets vs Yankees — Subway Series 2026', sport:'MLB', icon:'⚾', startUtc:'2026-06-12T23:10:00Z', venue:'Citi Field, New York', subtitle:'MLB 2026 · Subway Series', desc:'When is Mets vs Yankees (Subway Series) in {tz}? Exact first pitch time and live countdown.' },
  { slugs:['when-is-astros-vs-rangers-2026'], name:'Astros vs Rangers 2026', sport:'MLB', icon:'⚾', startUtc:'2026-05-22T23:10:00Z', venue:'Minute Maid Park, Houston', subtitle:'MLB 2026 · AL West Rivalry', desc:'When is Astros vs Rangers in {tz}? Exact first pitch time and live countdown.' },
  { slugs:['when-is-phillies-vs-braves-2026'], name:'Phillies vs Braves 2026', sport:'MLB', icon:'⚾', startUtc:'2026-05-22T23:05:00Z', venue:'Citizens Bank Park, Philadelphia', subtitle:'MLB 2026 · NL East Rivalry', desc:'When is Phillies vs Braves in {tz}? Exact first pitch time and live countdown.' },
  { slugs:['when-is-world-series-2026'], name:'World Series 2026', sport:'MLB', icon:'⚾', startUtc:'2026-10-20T23:08:00Z', venue:'TBD — Higher seed home stadium', subtitle:'MLB 2026 · World Series', desc:'When is the World Series 2026 in {tz}? Game 1 first pitch time and full schedule.' },
  { slugs:['when-is-next-mlb-game'], name:'Next MLB Game', sport:'MLB', icon:'⚾', startUtc:'2026-05-22T23:10:00Z', venue:'TBD', subtitle:'MLB 2026 · Regular Season', desc:'When is the next MLB game in {tz}? Exact first pitch time and live countdown.' },

  // Cricket / IPL
  { slugs:['when-is-ipl-final-2026'], name:'IPL 2026 Final', sport:'Cricket', icon:'🏏', startUtc:'2026-05-24T14:00:00Z', venue:'Narendra Modi Stadium, Ahmedabad', subtitle:'IPL 2026 · Grand Final', desc:'When is the IPL 2026 Final in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-ipl-qualifier-1-2026'], name:'IPL 2026 — Qualifier 1', sport:'Cricket', icon:'🏏', startUtc:'2026-05-19T14:00:00Z', venue:'Narendra Modi Stadium, Ahmedabad', subtitle:'IPL 2026 · Qualifier 1', desc:'When is IPL 2026 Qualifier 1 in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-ipl-eliminator-2026'], name:'IPL 2026 — Eliminator', sport:'Cricket', icon:'🏏', startUtc:'2026-05-20T14:00:00Z', venue:'Eden Gardens, Kolkata', subtitle:'IPL 2026 · Eliminator', desc:'When is the IPL 2026 Eliminator in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-rcb-vs-mi-ipl-2026'], name:'RCB vs Mumbai Indians — IPL 2026', sport:'Cricket', icon:'🏏', startUtc:'2026-05-07T14:00:00Z', venue:'M. Chinnaswamy Stadium, Bengaluru', subtitle:'IPL 2026 · T20', desc:'When is RCB vs Mumbai Indians in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-csk-vs-mi-ipl-2026'], name:'CSK vs Mumbai Indians — IPL 2026', sport:'Cricket', icon:'🏏', startUtc:'2026-05-07T14:00:00Z', venue:'MA Chidambaram Stadium, Chennai', subtitle:'IPL 2026 · T20', desc:'When is CSK vs Mumbai Indians in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-kkr-vs-rcb-ipl-2026'], name:'KKR vs RCB — IPL 2026', sport:'Cricket', icon:'🏏', startUtc:'2026-05-08T14:00:00Z', venue:'Eden Gardens, Kolkata', subtitle:'IPL 2026 · T20', desc:'When is KKR vs RCB in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-next-ipl-match'], name:'Next IPL Match', sport:'Cricket', icon:'🏏', startUtc:'2026-05-19T14:00:00Z', venue:'Narendra Modi Stadium, Ahmedabad', subtitle:'IPL 2026 · Playoffs', desc:'When is the next IPL match in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-t20-world-cup-2026'], name:"Men's T20 World Cup 2026", sport:'Cricket', icon:'🏏', startUtc:'2026-10-01T10:00:00Z', venue:'Various Venues', subtitle:"ICC Men's T20 World Cup 2026", desc:'When is the T20 World Cup 2026 in {tz}? Schedule, kick-off times and live countdown.' },
  { slugs:['when-is-t20-world-cup-final-2026'], name:"Men's T20 World Cup Final 2026", sport:'Cricket', icon:'🏏', startUtc:'2026-11-08T10:00:00Z', venue:'TBD', subtitle:"ICC Men's T20 World Cup 2026 · Final", desc:'When is the T20 World Cup Final 2026 in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-india-vs-pakistan-t20-world-cup-2026'], name:'India vs Pakistan — T20 World Cup 2026', sport:'Cricket', icon:'🏏', startUtc:'2026-10-15T14:00:00Z', venue:'TBD', subtitle:"ICC Men's T20 World Cup 2026 · Group Stage", desc:'When is India vs Pakistan at the T20 World Cup 2026 in {tz}? The biggest match in cricket!' },
  { slugs:['when-is-india-vs-australia-t20-world-cup-2026'], name:'India vs Australia — T20 World Cup 2026', sport:'Cricket', icon:'🏏', startUtc:'2026-10-10T14:00:00Z', venue:'TBD', subtitle:"ICC Men's T20 World Cup 2026 · Group Stage", desc:'When is India vs Australia at the T20 World Cup 2026 in {tz}? Exact start time and live countdown.' },
  { slugs:['when-is-next-cricket-match'], name:'Next Cricket Match', sport:'Cricket', icon:'🏏', startUtc:'2026-05-19T14:00:00Z', venue:'Narendra Modi Stadium, Ahmedabad', subtitle:'IPL 2026 · Playoffs', desc:'When is the next cricket match in {tz}? Exact start time and live countdown.' },

  // EPL
  { slugs:['when-is-epl-2026-27-season-start'], name:'EPL 2026-27 Season Start', sport:'EPL', icon:'⚽', startUtc:'2026-08-08T11:30:00Z', venue:'Various grounds, England', subtitle:'Premier League 2026-27 · Matchday 1', desc:'When does the Premier League 2026-27 season start in {tz}? Kick-off times and matchday schedule.' },
  { slugs:['when-is-arsenal-vs-liverpool-2026'], name:'Arsenal vs Liverpool 2026-27', sport:'EPL', icon:'⚽', startUtc:'2026-11-08T16:30:00Z', venue:'Emirates Stadium, London', subtitle:'Premier League 2026-27', desc:'When is Arsenal vs Liverpool in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-liverpool-vs-manchester-city-2026'], name:'Liverpool vs Manchester City 2026-27', sport:'EPL', icon:'⚽', startUtc:'2026-10-25T16:30:00Z', venue:'Anfield, Liverpool', subtitle:'Premier League 2026-27', desc:'When is Liverpool vs Manchester City in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-manchester-city-vs-arsenal-2026'], name:'Manchester City vs Arsenal 2026-27', sport:'EPL', icon:'⚽', startUtc:'2026-12-13T16:30:00Z', venue:'Etihad Stadium, Manchester', subtitle:'Premier League 2026-27', desc:'When is Manchester City vs Arsenal in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-manchester-united-vs-liverpool-2026'], name:'Manchester United vs Liverpool 2026-27', sport:'EPL', icon:'⚽', startUtc:'2026-09-13T13:00:00Z', venue:'Old Trafford, Manchester', subtitle:'Premier League 2026-27', desc:'When is Manchester United vs Liverpool in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-chelsea-vs-arsenal-2026'], name:'Chelsea vs Arsenal 2026-27', sport:'EPL', icon:'⚽', startUtc:'2026-09-20T13:00:00Z', venue:'Stamford Bridge, London', subtitle:'Premier League 2026-27', desc:'When is Chelsea vs Arsenal in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-tottenham-vs-arsenal-2026'], name:'Tottenham vs Arsenal — North London Derby 2026-27', sport:'EPL', icon:'⚽', startUtc:'2026-11-22T16:30:00Z', venue:'Tottenham Hotspur Stadium, London', subtitle:'Premier League 2026-27 · North London Derby', desc:'When is the North London Derby (Tottenham vs Arsenal) in {tz}? Exact kick-off time and live countdown.' },
  { slugs:['when-is-next-premier-league-match'], name:'Next Premier League Match', sport:'EPL', icon:'⚽', startUtc:'2026-08-08T11:30:00Z', venue:'Various grounds, England', subtitle:'Premier League 2026-27', desc:'When is the next Premier League match in {tz}? Exact kick-off times and live countdown.' },
  { slugs:['when-is-el-clasico-2026-27'], name:'El Clasico 2026-27 (Real Madrid vs Barcelona)', sport:'La Liga', icon:'⚽', startUtc:'2026-10-18T19:00:00Z', venue:'Santiago Bernabeu, Madrid', subtitle:'La Liga 2026-27 · El Clasico', desc:'When is El Clasico (Real Madrid vs Barcelona) in {tz}? Exact kick-off time and live countdown.' },

  // UCL / UEL
  { slugs:['when-is-champions-league-final-2026'], name:'UEFA Champions League Final 2026', sport:'UEFA CL', icon:'🏆', startUtc:'2026-05-30T16:00:00Z', venue:'Puskas Arena, Budapest', subtitle:'UEFA Champions League 2025-26 · Final · PSG vs Arsenal', desc:'When is the Champions League Final 2026 in {tz}? PSG vs Arsenal kick-off time and live countdown.' },
  { slugs:['when-is-europa-league-final-2026'], name:'UEFA Europa League Final 2026', sport:'UEFA EL', icon:'🏆', startUtc:'2026-05-27T18:00:00Z', venue:'TBD — Europa League Final', subtitle:'UEFA Europa League 2025-26 · Final', desc:'When is the Europa League Final 2026 in {tz}? Exact kick-off time and live countdown.' },
];

// Build lookup
const EVENTS = {};
for (const ev of EVENTS_LIST) {
  for (const s of ev.slugs) EVENTS[s] = ev;
}

// Detect TZ suffix
const TZ_SUFFIX_ORDER = ['-australia','-india','-nz','-uk','-us'];
function parseSlug(fullSlug) {
  for (const suf of TZ_SUFFIX_ORDER) {
    if (fullSlug.endsWith(suf)) {
      const tzKey = suf.slice(1);
      return { baseSlug: fullSlug.slice(0, -suf.length), tzKey, tzDef: TZ_DEFS[tzKey] || null };
    }
  }
  return { baseSlug: fullSlug, tzKey: null, tzDef: null };
}

// Parse sitemap for slugs
const sitemap = fs.readFileSync(path.join(DIR,'sitemap.xml'),'utf8');
const slugs = [...sitemap.matchAll(/<loc>https:\/\/whenisthisgame\.com\/([^<]+)<\/loc>/g)]
  .map(m => m[1]).filter(s => s && s.length > 1);

// CSS (same design as index.html)
const CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--accent:#FFD23F;--live:#FF3B3B;--green:#00D68F;--bg:#080808;--bg2:#111;--bg3:#1a1a1a;--border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.14);--text:#fff;--muted:rgba(255,255,255,0.42);--muted2:rgba(255,255,255,0.2);--fd:'Bebas Neue',cursive;--fb:'DM Sans',sans-serif}
html{scroll-behavior:smooth}
body{font-family:var(--fb);background:var(--bg);color:var(--text);overflow-x:hidden}
nav{position:sticky;top:0;z-index:100;background:rgba(8,8,8,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:60px}
.logo{font-family:var(--fd);font-size:26px;letter-spacing:1px;display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--text)}
.logo span{color:var(--accent)}
.ldot{width:8px;height:8px;background:var(--live);border-radius:50%;animation:pulse 1.8s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(255,59,59,0.5)}60%{opacity:.7;box-shadow:0 0 0 7px rgba(255,59,59,0)}}
.nav-r{display:flex;align-items:center;gap:12px;font-size:13px;color:var(--muted)}
.tz-chip{background:rgba(255,210,63,0.12);color:var(--accent);border:1px solid rgba(255,210,63,0.25);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
.nav-clock{font-family:var(--fd);font-size:22px;color:var(--accent);letter-spacing:2px}
.page-wrap{max-width:900px;margin:0 auto;padding:32px 32px 0}
.back-link{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:13px;text-decoration:none;margin-bottom:18px;transition:color .15s}
.back-link:hover{color:var(--accent)}
.sport-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(255,210,63,0.1);border:1px solid rgba(255,210,63,0.25);padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;color:var(--accent);letter-spacing:.5px;text-transform:uppercase;margin-bottom:12px}
.page-h1{font-family:var(--fd);font-size:52px;line-height:1.05;letter-spacing:1px;margin-bottom:10px}
.page-sub{font-size:14px;color:var(--muted);margin-bottom:28px}
.event-card{background:var(--bg2);border:1px solid rgba(255,210,63,0.3);border-radius:16px;padding:28px;margin-bottom:32px;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.ev-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px}
.ev-name{font-family:var(--fd);font-size:26px;letter-spacing:.5px;margin-bottom:4px;line-height:1.15}
.ev-sub{font-size:13px;color:var(--muted);margin-bottom:14px}
.ev-venue{display:flex;align-items:flex-start;gap:6px;font-size:13px;color:var(--muted)}
.time-block{background:var(--bg3);border:1px solid var(--border2);border-radius:12px;padding:18px 20px;margin-bottom:14px}
.time-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px}
.time-val{font-family:var(--fd);font-size:20px;letter-spacing:.3px;color:var(--accent);line-height:1.25}
.countdown-block{background:linear-gradient(135deg,rgba(255,210,63,.07),rgba(255,59,59,.04));border:1px solid rgba(255,210,63,.2);border-radius:12px;padding:18px 20px}
.countdown-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
.countdown-val{font-family:var(--fd);font-size:42px;color:var(--live);letter-spacing:3px;line-height:1}
.faq-section{max-width:900px;margin:0 auto;padding:0 32px 48px}
.faq-title{font-family:var(--fd);font-size:32px;letter-spacing:1px;margin-bottom:22px}
.faq-title span{color:var(--accent)}
.faq-item{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px 22px;margin-bottom:10px}
.faq-q{font-size:16px;font-weight:600;margin-bottom:8px}
.faq-a{font-size:14px;color:var(--muted);line-height:1.7}
.how{background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:52px 32px;margin-top:8px}
.how-inner{max-width:900px;margin:0 auto}
.how-title{font-family:var(--fd);font-size:36px;letter-spacing:1px;text-align:center;margin-bottom:6px}
.how-sub{text-align:center;color:var(--muted);font-size:14px;margin-bottom:36px}
.how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.hcard{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:22px}
.hnum{font-family:var(--fd);font-size:48px;color:rgba(255,210,63,.12);line-height:1;margin-bottom:8px}
.hcard-t{font-size:15px;font-weight:600;margin-bottom:6px}
.hcard-b{color:var(--muted);font-size:13px;line-height:1.7}
footer{background:var(--bg2);border-top:1px solid var(--border);padding:32px}
.fi{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.flogo{font-family:var(--fd);font-size:22px;letter-spacing:1px;display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--text)}
.flogo span{color:var(--accent)}
.flinks{display:flex;gap:20px;flex-wrap:wrap}
.flinks a{font-size:13px;color:var(--muted);text-decoration:none;transition:color .15s}
.flinks a:hover{color:var(--text)}
.fcopy{font-size:12px;color:var(--muted2);margin-top:5px}
@media(max-width:680px){.page-h1{font-size:34px}.event-card{grid-template-columns:1fr}.how-grid{grid-template-columns:1fr}nav{padding:0 16px}.page-wrap{padding:20px 16px 0}.faq-section{padding:0 16px 40px}}`;

function humanTitle(slug) {
  return slug.replace(/-/g,' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\b(In|Vs|The|Of|And|A|Is)\b/g, w => w.toLowerCase())
    .replace(/^\w/, c => c.toUpperCase());
}

function fmtDate(utcStr, ianaZone) {
  try {
    const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', timeZoneName:'short' };
    if (ianaZone) opts.timeZone = ianaZone;
    return new Date(utcStr).toLocaleString('en-US', opts);
  } catch(e) { return utcStr; }
}

function buildHTML(slug, ev, tzKey, tzDef) {
  const tzLabel = tzDef ? tzDef.label : 'your local time';
  const ianaZone = tzDef ? tzDef.ianaZone : null;
  const desc = ev.desc.replace('{tz}', tzLabel);
  const title = humanTitle(slug);
  const formattedDate = fmtDate(ev.startUtc, ianaZone);
  const startMs = new Date(ev.startUtc).getTime();
  const tzJS = ianaZone ? `"${ianaZone}"` : 'Intl.DateTimeFormat().resolvedOptions().timeZone';

  const faqs = [
    { q:`When is ${ev.name} in ${tzLabel}?`, a:`${ev.name} starts on ${formattedDate}. The live countdown above shows the exact time remaining until the event begins.` },
    { q:`What time does ${ev.name} start?`, a:`The event is scheduled for ${ev.startUtc.replace('T',' ').replace('Z',' UTC')} at ${ev.venue}. Use the countdown on this page for your exact local time.` },
    { q:`Where can I watch ${ev.name}?`, a:`Check your local sports broadcaster or streaming service for ${ev.sport} coverage in your region. Availability varies by country.` },
    { q:`How do I convert the ${ev.sport} start time to my timezone?`, a:`GameTimeNow converts automatically. Visit whenisthisgame.com to see all upcoming events in your exact local time — no manual conversions needed.` },
  ];

  const faqHtml = faqs.map(f =>
    `<div class="faq-item"><h3 class="faq-q">${f.q}</h3><p class="faq-a">${f.a}</p></div>`
  ).join('\n');

  const faqLD = JSON.stringify({
    "@context":"https://schema.org","@type":"FAQPage",
    "mainEntity": faqs.map(f => ({ "@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a} }))
  });
  const evLD = JSON.stringify({
    "@context":"https://schema.org","@type":"SportsEvent",
    "name":ev.name,"startDate":ev.startUtc,
    "location":{"@type":"Place","name":ev.venue},
    "description":desc,"sport":ev.sport,
    "url":`https://whenisthisgame.com/${slug}`
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${desc.replace(/"/g,'&quot;').replace(/</g,'&lt;')}">
<title>${title} | GameTimeNow</title>
<link rel="canonical" href="https://whenisthisgame.com/${slug}">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${evLD}</script>
<script type="application/ld+json">${faqLD}</script>
<style>${CSS}</style>
</head>
<body>
<nav>
  <a href="/" class="logo"><div class="ldot"></div>GameTime<span>Now</span></a>
  <div class="nav-r">
    <span>Your timezone:</span>
    <span class="tz-chip" id="navTz">Detecting...</span>
    <div class="nav-clock" id="navClock">--:--</div>
  </div>
</nav>

<div class="page-wrap">
  <a href="/" class="back-link">&#8592; All events</a>
  <div class="sport-tag">${ev.icon} ${ev.sport}</div>
  <h1 class="page-h1">${title}</h1>
  <p class="page-sub">${ev.subtitle}</p>

  <div class="event-card">
    <div>
      <div class="ev-label">Event</div>
      <div class="ev-name">${ev.name}</div>
      <div class="ev-sub">${ev.subtitle}</div>
      <div class="ev-venue"><span>&#128205;</span>${ev.venue}</div>
    </div>
    <div>
      <div class="time-block">
        <div class="time-label">Start time &mdash; ${tzLabel}</div>
        <div class="time-val" id="localTime">${formattedDate}</div>
      </div>
      <div class="countdown-block">
        <div class="countdown-label">Live countdown</div>
        <div class="countdown-val" id="countdown">--:--:--</div>
      </div>
    </div>
  </div>
</div>

<section class="faq-section">
  <h2 class="faq-title">Frequently Asked <span>Questions</span></h2>
  ${faqHtml}
</section>

<section class="how">
  <div class="how-inner">
    <h2 class="how-title">How <span style="color:var(--accent)">it works</span></h2>
    <p class="how-sub">Zero friction. From search to kickoff in seconds.</p>
    <div class="how-grid">
      <div class="hcard"><div class="hnum">01</div><div class="hcard-t">We detect your timezone instantly</div><div class="hcard-b">The moment you land, GameTimeNow auto-detects where you are. No sign-up, no settings. Auckland, Sydney, Tokyo, London — it just works.</div></div>
      <div class="hcard"><div class="hnum">02</div><div class="hcard-t">Every event converted automatically</div><div class="hcard-b">Curated schedules for F1, World Cup, Cricket, UFC, NBA, EPL and more. Every event shown in your exact local time — day, hour and minute.</div></div>
      <div class="hcard"><div class="hnum">03</div><div class="hcard-t">See all events in one place</div><div class="hcard-b">Browse the full schedule at <a href="/" style="color:var(--accent)">GameTimeNow</a> — live countdowns for every upcoming event in your local time. Never miss a game again.</div></div>
    </div>
  </div>
</section>

<footer>
  <div class="fi">
    <div>
      <a href="/" class="flogo"><div class="ldot"></div>GameTime<span>Now</span></a>
      <div class="fcopy">&copy; 2026 GameTimeNow &middot; Times shown in your local timezone</div>
    </div>
    <div class="flinks">
      <a href="/">Home</a>
      <a href="/">F1 Times</a>
      <a href="/">World Cup</a>
      <a href="/">NBA Times</a>
      <a href="/">Privacy</a>
    </div>
  </div>
</footer>

<script>
const PAGE_TZ = ${tzJS};
const START_MS = ${startMs};

function tick() {
  const now = new Date();
  // Clock
  try {
    document.getElementById('navTz').textContent = PAGE_TZ.split('/').pop().replace(/_/g,' ');
    document.getElementById('navClock').textContent = now.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:PAGE_TZ});
  } catch(e) {}

  // Local time
  try {
    const opts = {weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',timeZoneName:'short',timeZone:PAGE_TZ};
    document.getElementById('localTime').textContent = new Date(START_MS).toLocaleString('en-US',opts);
  } catch(e) {}

  // Countdown
  const diff = START_MS - Date.now();
  const el = document.getElementById('countdown');
  if (diff <= 0) {
    el.style.color = 'var(--green)';
    el.style.fontSize = '24px';
    el.textContent = diff > -10800000 ? 'LIVE NOW 🔴' : 'Event Ended';
  } else {
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    el.textContent = d > 0 ? d+'d '+h+'h '+m+'m' : h+'h '+m+'m '+String(s).padStart(2,'0')+'s';
  }
}
tick();
setInterval(tick, 1000);
</script>
</body>
</html>`;
}

// Generate all HTML files
let written = 0, skipped = 0;
for (const slug of slugs) {
  const { baseSlug, tzKey, tzDef } = parseSlug(slug);
  const ev = EVENTS[baseSlug] || EVENTS[slug];
  if (!ev) {
    console.warn('No event for slug:', slug, '(base:', baseSlug + ')');
    skipped++;
    continue;
  }
  const html = buildHTML(slug, ev, tzKey, tzDef);
  fs.writeFileSync(path.join(DIR, slug + '.html'), html, 'utf8');
  written++;
  if (written % 50 === 0) process.stdout.write('.');
}
console.log(`\nDone: ${written} HTML files written, ${skipped} slugs skipped.`);
