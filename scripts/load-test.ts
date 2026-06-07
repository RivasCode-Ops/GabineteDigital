// Load test script — gera dados massivos para teste de desempenho
// Uso: npx tsx scripts/load-test.ts
// Requer: DATABASE_URL no .env

import { PrismaClient } from "../src/generated/prisma/client";
import type { PersonCategory, DemandStatus, DemandCategory, DemandPriority, ActivityType, EventType, EventStatus, Sentiment } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const N_PEOPLE = 500;
const N_LEADERSHIPS = 100;
const N_DEMANDS = 50;
const N_EVENTS = 20;
const N_SURVEYS = 10;

const firstNames = ["Ana","Carlos","Maria","Joao","Lucia","Pedro","Sandra","Roberto","Fernanda","Ricardo","Juliana","Marcos","Patricia","Lucas","Camila","Gabriel","Marina","Rafael","Beatriz","Eduardo","Larissa","Felipe","Amanda","Bruno","Vanessa","Diego","Tatiane","Leonardo","Aline","Thiago"];
const lastNames = ["Silva","Santos","Oliveira","Souza","Lima","Pereira","Costa","Ferreira","Almeida","Ribeiro","Carvalho","Gomes","Martins","Rodrigues","Nascimento","Araujo","Barbosa","Mendes","Dias","Vieira"];

const cats: PersonCategory[] = ["lideranca","morador","empresario","vereador","influenciador"];
const sts: DemandStatus[] = ["recebida","triagem","encaminhada","acompanhamento","resolvida"];
const dcs: DemandCategory[] = ["saude","educacao","infraestrutura","transporte","agricultura"];
const prs: DemandPriority[] = ["baixa","media","alta"];
const ats: ActivityType[] = ["visita","reuniao","evento","ligacao","atendimento"];
const ets: EventType[] = ["reuniao","evento","audiencia","visita","entrevista"];
const sens: Sentiment[] = ["muito_favoravel","favoravel","neutro","resistente","muito_resistente"];

function rnd<T>(a: readonly T[]): T { return a[Math.floor(Math.random() * a.length)]; }

function phone(): string {
  return `(${String(11 + Math.floor(Math.random()*20))}) 9${String(90000 + Math.floor(Math.random()*10000))}-${String(Math.floor(Math.random()*10000)).padStart(4,"0")}`;
}

function dateAgo(d: number): Date { const x = new Date(); x.setDate(x.getDate() - Math.floor(Math.random()*d)); return x; }

async function main() {
  console.log("=== Load Test ===\n");
  const t = await prisma.territory.findMany({where:{deletedAt:null}});
  if (!t.length) { console.log("Crie territorios"); await prisma.$disconnect(); process.exit(1); }
  const u = await prisma.user.findMany({where:{deletedAt:null,isActive:true}});
  if (!u.length) { console.log("Rode seed"); await prisma.$disconnect(); process.exit(1); }
  console.log(`Territorios: ${t.length}, Usuarios: ${u.length}\n`);

  console.log(`Pessoas ${N_PEOPLE}...`);
  const pids: string[] = [];
  for (let i = 0; i < N_PEOPLE; i++) {
    const r = await prisma.person.create({data:{id:randomUUID(),name:`${rnd(firstNames)} ${rnd(lastNames)}`,phone:phone(),category:rnd(cats),territoryId:rnd(t).id,consentGiven:true,createdAt:dateAgo(90),updatedAt:new Date()}});
    pids.push(r.id);
    if ((i+1)%100===0) console.log(`  ${i+1}/${N_PEOPLE}`);
  }
  console.log("  OK\n");

  console.log(`Liderancas ${N_LEADERSHIPS}...`);
  for (let i = 0; i < N_LEADERSHIPS && i < pids.length; i++) {
    await prisma.leadership.create({data:{id:randomUUID(),leaderId:pids[i],role:rnd(["presidente_associacao","lideranca_comunitaria","sindico"]),territoryId:rnd(t).id,startDate:dateAgo(60),isActive:true,createdAt:dateAgo(60),updatedAt:new Date()}});
    if ((i+1)%25===0) console.log(`  ${i+1}/${N_LEADERSHIPS}`);
  }
  console.log("  OK\n");

  console.log(`Demandas ${N_DEMANDS}...`);
  for (let i = 0; i < N_DEMANDS; i++) {
    await prisma.demand.create({data:{id:randomUUID(),title:`Demanda #${i+1}`,description:`Descricao #${i+1}`,category:rnd(dcs),status:rnd(sts),priority:rnd(prs),territoryId:rnd(t).id,createdBy:rnd(u).id,createdAt:dateAgo(45),updatedAt:new Date()}});
    if ((i+1)%10===0) console.log(`  ${i+1}/${N_DEMANDS}`);
  }
  console.log("  OK\n");

  console.log(`Atividades ${N_DEMANDS}...`);
  for (let i = 0; i < N_DEMANDS; i++) {
    await prisma.activity.create({data:{id:randomUUID(),title:`Atividade #${i+1}`,type:rnd(ats),description:`Descricao #${i+1}`,territoryId:rnd(t).id,performedAt:dateAgo(30),performedBy:rnd(u).id,createdAt:dateAgo(30),updatedAt:new Date()}});
    if ((i+1)%10===0) console.log(`  ${i+1}/${N_DEMANDS}`);
  }
  console.log("  OK\n");

  console.log(`Eventos ${N_EVENTS}...`);
  for (let i = 0; i < N_EVENTS; i++) {
    const s = new Date(); s.setDate(s.getDate()+Math.floor(Math.random()*60));
    const e = new Date(s); e.setHours(e.getHours()+1);
    await prisma.event.create({data:{id:randomUUID(),title:`Evento #${i+1}`,type:rnd(ets),status:"scheduled",startAt:s,endAt:e,territoryId:rnd(t).id,createdBy:rnd(u).id,createdAt:dateAgo(15),updatedAt:new Date()}});
  }
  console.log("  OK\n");

  console.log(`Pesquisas ${N_SURVEYS}...`);
  for (let i = 0; i < N_SURVEYS; i++) {
    await prisma.survey.create({data:{id:randomUUID(),title:`Pesquisa #${i+1}`,sentiment:rnd(sens),collectedBy:rnd(u).id,collectedAt:dateAgo(30),createdAt:dateAgo(30),updatedAt:new Date()}});
  }
  console.log("  OK\n");

  console.log("=== Completo ===");
  console.log(`${N_PEOPLE} pessoas, ${N_LEADERSHIPS} liderancas, ${N_DEMANDS} demandas, ${N_DEMANDS} atividades, ${N_EVENTS} eventos, ${N_SURVEYS} pesquisas`);
  await prisma.$disconnect();
}

main().catch(e=>{console.error(e);prisma.$disconnect();process.exit(1);});
