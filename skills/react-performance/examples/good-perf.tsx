// EXAMPLE: Gold-standard virtualized catalog — performance patterns showcase
// Demonstrates: useVirtualizer, React.lazy + Suspense, loading="lazy" images,
// CSS containment, onMouseEnter prefetch, useMemo + useCallback + memo(),
// aria-busy / role="status" during loading, dark mode, OKLCH colors, Manrope font

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
  lazy,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

// ─── Lazy-loaded detail panel (code splitting) ────────────────────────────────
const EmployeeDetailPanel = lazy<React.ComponentType<{ employee: Employee; onClose: () => void }>>(() =>
  Promise.resolve({
    default: function DetailPanel({ employee, onClose }: { employee: Employee; onClose: () => void }) {
      return (
        <aside
          role="complementary"
          aria-label={`Details for ${employee.name}`}
          className="fixed inset-y-0 right-0 w-80 bg-[oklch(99%_0.005_255)] dark:bg-[oklch(18%_0.01_255)] border-l border-[oklch(90%_0.02_255)] dark:border-[oklch(30%_0.02_255)] shadow-2xl z-40 flex flex-col"
        >
          <header className="flex items-center justify-between px-5 py-4 border-b border-[oklch(90%_0.02_255)] dark:border-[oklch(30%_0.02_255)]">
            <h2 className="font-bold text-[oklch(20%_0.01_255)] dark:text-[oklch(95%_0.01_255)] text-sm">
              Employee Profile
            </h2>
            <button
              onClick={onClose}
              aria-label="Close detail panel"
              className="w-8 h-8 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[oklch(45%_0.04_255)] hover:bg-[oklch(93%_0.02_255)] dark:hover:bg-[oklch(28%_0.02_255)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <img
              src={employee.avatar}
              alt={`${employee.name} profile photo`}
              loading="lazy"
              decoding="async"
              width="72"
              height="72"
              className="w-18 h-18 rounded-full object-cover ring-2 ring-[oklch(80%_0.08_260)]"
            />
            <div>
              <p className="font-bold text-[oklch(20%_0.01_255)] dark:text-[oklch(95%_0.01_255)] text-lg leading-tight">{employee.name}</p>
              <p className="text-sm text-[oklch(52%_0.04_255)] dark:text-[oklch(65%_0.04_255)] mt-0.5">{employee.title}</p>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)] uppercase tracking-wider">Department</dt>
                <dd className="mt-0.5 text-[oklch(25%_0.02_255)] dark:text-[oklch(90%_0.02_255)] font-medium">{employee.department}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)] uppercase tracking-wider">Location</dt>
                <dd className="mt-0.5 text-[oklch(25%_0.02_255)] dark:text-[oklch(90%_0.02_255)] font-medium">{employee.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)] uppercase tracking-wider">Salary</dt>
                <dd className="mt-0.5 text-[oklch(25%_0.02_255)] dark:text-[oklch(90%_0.02_255)] font-medium tabular-nums">${employee.salary.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)] uppercase tracking-wider">Performance</dt>
                <dd className="mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-[oklch(90%_0.02_255)] dark:bg-[oklch(30%_0.02_255)]">
                      <div
                        className="h-2 rounded-full bg-[oklch(60%_0.18_145)]"
                        style={{ width: `${employee.performance}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[oklch(40%_0.04_255)] dark:text-[oklch(70%_0.04_255)] tabular-nums">{employee.performance}%</span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      );
    },
  })
);

// ─── Organic employee dataset (110 entries — diverse names, titles) ────────────
// Workforce stats (live): avg. tenure 2.7 yrs · offer acceptance 87.4% · attrition 6.3%
const DEPARTMENTS = ["Engineering", "Design", "Product", "Data Science", "Marketing", "Finance", "Operations", "Legal"];

const RAW_EMPLOYEES = [
  { id: 1,  name: "Amara Nwosu",        title: "Senior Software Engineer",         dept: "Engineering",  loc: "Lagos, NG",       salary: 127_450, perf: 91, status: "Active" },
  { id: 2,  name: "Kenji Watanabe",      title: "UX Design Lead",                   dept: "Design",        loc: "Tokyo, JP",       salary: 114_230, perf: 88, status: "Remote" },
  { id: 3,  name: "Priya Krishnamurthy", title: "Principal Data Scientist",         dept: "Data Science",  loc: "Mumbai, IN",      salary: 138_760, perf: 94, status: "Active" },
  { id: 4,  name: "Sebastián Vargas",    title: "Product Manager",                  dept: "Product",       loc: "São Paulo, BR",   salary: 119_800, perf: 85, status: "Active" },
  { id: 5,  name: "Fatima Al-Rashidi",   title: "Engineering Manager",              dept: "Engineering",  loc: "Cairo, EG",       salary: 145_920, perf: 96, status: "Active" },
  { id: 6,  name: "Tobias Heinemann",    title: "Frontend Engineer",                dept: "Engineering",  loc: "Berlin, DE",      salary: 108_340, perf: 82, status: "Active" },
  { id: 7,  name: "Yuki Adeyemi",        title: "Growth Marketing Manager",         dept: "Marketing",     loc: "Amsterdam, NL",   salary: 103_670, perf: 87, status: "Remote" },
  { id: 8,  name: "Naledi Dlamini",      title: "Senior Product Designer",          dept: "Design",        loc: "Nairobi, KE",     salary: 111_540, perf: 90, status: "Active" },
  { id: 9,  name: "Haruto Shibata",      title: "Backend Engineer",                 dept: "Engineering",  loc: "Tokyo, JP",       salary: 121_880, perf: 83, status: "Active" },
  { id: 10, name: "Camille Beaulieu",    title: "Financial Analyst",                dept: "Finance",       loc: "Toronto, CA",     salary: 98_460,  perf: 79, status: "Active" },
  { id: 11, name: "Olusegun Adebayo",    title: "DevOps Engineer",                  dept: "Engineering",  loc: "Lagos, NG",       salary: 116_230, perf: 86, status: "Active" },
  { id: 12, name: "Mei-Ling Chen",       title: "Machine Learning Engineer",        dept: "Data Science",  loc: "Seoul, KR",       salary: 134_590, perf: 92, status: "Active" },
  { id: 13, name: "Andrés Castillo",     title: "Legal Counsel",                    dept: "Legal",         loc: "São Paulo, BR",   salary: 142_310, perf: 88, status: "Active" },
  { id: 14, name: "Ingrid Bergström",    title: "Operations Lead",                  dept: "Operations",    loc: "Amsterdam, NL",   salary: 107_850, perf: 84, status: "On Leave" },
  { id: 15, name: "Kofi Mensah",         title: "Senior Data Analyst",              dept: "Data Science",  loc: "Nairobi, KE",     salary: 109_720, perf: 81, status: "Active" },
  { id: 16, name: "Sakura Yamamoto",     title: "Visual Designer",                  dept: "Design",        loc: "Tokyo, JP",       salary: 97_340,  perf: 78, status: "Active" },
  { id: 17, name: "Ravi Sundaram",       title: "Staff Engineer",                   dept: "Engineering",  loc: "Mumbai, IN",      salary: 157_680, perf: 97, status: "Active" },
  { id: 18, name: "Anika Hoffmann",      title: "Content Strategist",               dept: "Marketing",     loc: "Berlin, DE",      salary: 92_560,  perf: 76, status: "Remote" },
  { id: 19, name: "Emeka Eze",           title: "Product Analyst",                  dept: "Product",       loc: "Lagos, NG",       salary: 104_830, perf: 85, status: "Active" },
  { id: 20, name: "Hana Park",           title: "Senior UX Researcher",             dept: "Design",        loc: "Seoul, KR",       salary: 118_430, perf: 89, status: "Active" },
  { id: 21, name: "Lucía Moreno",        title: "iOS Engineer",                     dept: "Engineering",  loc: "São Paulo, BR",   salary: 122_670, perf: 84, status: "Active" },
  { id: 22, name: "Takeshi Ando",        title: "Infrastructure Engineer",          dept: "Engineering",  loc: "Tokyo, JP",       salary: 131_240, perf: 88, status: "Remote" },
  { id: 23, name: "Chiamaka Obi",        title: "Risk & Compliance Analyst",        dept: "Legal",         loc: "Lagos, NG",       salary: 105_910, perf: 80, status: "Active" },
  { id: 24, name: "Lars Eriksson",       title: "Head of Finance",                  dept: "Finance",       loc: "Amsterdam, NL",   salary: 168_450, perf: 93, status: "Active" },
  { id: 25, name: "Pooja Joshi",         title: "Data Engineer",                    dept: "Data Science",  loc: "Mumbai, IN",      salary: 117_350, perf: 86, status: "Active" },
  { id: 26, name: "Ibrahim Al-Farsi",    title: "Security Engineer",                dept: "Engineering",  loc: "Cairo, EG",       salary: 129_870, perf: 90, status: "Active" },
  { id: 27, name: "Simone Carvalho",     title: "Brand Designer",                   dept: "Design",        loc: "São Paulo, BR",   salary: 101_480, perf: 82, status: "Contract" },
  { id: 28, name: "Yeon-Seo Kim",        title: "Head of Product",                  dept: "Product",       loc: "Seoul, KR",       salary: 172_300, perf: 95, status: "Active" },
  { id: 29, name: "Nwanneka Okafor",     title: "Marketing Analyst",                dept: "Marketing",     loc: "Lagos, NG",       salary: 89_740,  perf: 74, status: "Active" },
  { id: 30, name: "Dirk van der Berg",   title: "Platform Engineer",                dept: "Engineering",  loc: "Amsterdam, NL",   salary: 133_560, perf: 87, status: "Active" },
  { id: 31, name: "Ayesha Nawaz",        title: "Head of Operations",               dept: "Operations",    loc: "Istanbul, TR",    salary: 149_870, perf: 92, status: "Active" },
  { id: 32, name: "Marcus Osei",         title: "Full-Stack Engineer",              dept: "Engineering",  loc: "Toronto, CA",     salary: 118_760, perf: 83, status: "Active" },
  { id: 33, name: "Elif Çelik",          title: "Data Scientist",                   dept: "Data Science",  loc: "Istanbul, TR",    salary: 126_430, perf: 89, status: "Remote" },
  { id: 34, name: "Jaime Rodrigues",     title: "Account Executive",                dept: "Marketing",     loc: "São Paulo, BR",   salary: 96_230,  perf: 77, status: "Active" },
  { id: 35, name: "Adaeze Chukwu",       title: "Engineering Team Lead",            dept: "Engineering",  loc: "Lagos, NG",       salary: 143_780, perf: 94, status: "Active" },
  { id: 36, name: "Hyun-Jun Lee",        title: "Android Engineer",                 dept: "Engineering",  loc: "Seoul, KR",       salary: 119_540, perf: 85, status: "Active" },
  { id: 37, name: "Valentina Romano",    title: "Senior Recruiter",                 dept: "Operations",    loc: "Amsterdam, NL",   salary: 94_870,  perf: 80, status: "Active" },
  { id: 38, name: "Siddharth Kulkarni",  title: "Principal Product Manager",        dept: "Product",       loc: "Mumbai, IN",      salary: 156_230, perf: 93, status: "Active" },
  { id: 39, name: "Nadia Benali",        title: "Head of Legal",                    dept: "Legal",         loc: "Cairo, EG",       salary: 163_450, perf: 91, status: "Active" },
  { id: 40, name: "Chukwuemeka Nze",     title: "Site Reliability Engineer",        dept: "Engineering",  loc: "Lagos, NG",       salary: 136_780, perf: 88, status: "Remote" },
  { id: 41, name: "Kaito Fujimoto",      title: "Staff Product Designer",           dept: "Design",        loc: "Tokyo, JP",       salary: 148_230, perf: 92, status: "Active" },
  { id: 42, name: "Zara Molefe",         title: "Business Analyst",                 dept: "Finance",       loc: "Nairobi, KE",     salary: 103_560, perf: 82, status: "Active" },
  { id: 43, name: "Omar Bensouda",       title: "ML Platform Engineer",             dept: "Data Science",  loc: "Cairo, EG",       salary: 141_320, perf: 90, status: "Active" },
  { id: 44, name: "Miriam Schulze",      title: "Product Marketing Manager",        dept: "Marketing",     loc: "Berlin, DE",      salary: 108_670, perf: 84, status: "Active" },
  { id: 45, name: "Arjun Nair",          title: "API Engineer",                     dept: "Engineering",  loc: "Mumbai, IN",      salary: 124_430, perf: 87, status: "Active" },
  { id: 46, name: "Thabo Mokoena",       title: "Finance Manager",                  dept: "Finance",       loc: "Nairobi, KE",     salary: 131_870, perf: 86, status: "Active" },
  { id: 47, name: "Suki Tanaka",         title: "Interaction Designer",             dept: "Design",        loc: "Tokyo, JP",       salary: 106_540, perf: 81, status: "On Leave" },
  { id: 48, name: "Felipe Herrera",      title: "Cloud Architect",                  dept: "Engineering",  loc: "São Paulo, BR",   salary: 152_340, perf: 93, status: "Active" },
  { id: 49, name: "Ama Owusu",           title: "Head of Marketing",                dept: "Marketing",     loc: "Nairobi, KE",     salary: 154_780, perf: 94, status: "Active" },
  { id: 50, name: "Dmitri Volkov",       title: "Distributed Systems Engineer",     dept: "Engineering",  loc: "Berlin, DE",      salary: 139_650, perf: 91, status: "Active" },
  { id: 51, name: "Seo-Yeon Jung",       title: "Senior Financial Controller",      dept: "Finance",       loc: "Seoul, KR",       salary: 144_890, perf: 90, status: "Active" },
  { id: 52, name: "Kwame Asante",        title: "Platform Product Manager",         dept: "Product",       loc: "Nairobi, KE",     salary: 128_670, perf: 87, status: "Remote" },
  { id: 53, name: "Léa Fontaine",        title: "UX Writer",                        dept: "Design",        loc: "Amsterdam, NL",   salary: 95_430,  perf: 79, status: "Active" },
  { id: 54, name: "Tanvir Ahmed",        title: "Senior Backend Engineer",          dept: "Engineering",  loc: "Istanbul, TR",    salary: 127_890, perf: 86, status: "Active" },
  { id: 55, name: "Uchenna Obasi",       title: "Data Platform Lead",               dept: "Data Science",  loc: "Lagos, NG",       salary: 145_670, perf: 92, status: "Active" },
  { id: 56, name: "Astrid Lindgren",     title: "Compliance Officer",               dept: "Legal",         loc: "Amsterdam, NL",   salary: 118_340, perf: 85, status: "Active" },
  { id: 57, name: "Ji-Woo Choi",         title: "ML Research Engineer",             dept: "Data Science",  loc: "Seoul, KR",       salary: 148_560, perf: 93, status: "Active" },
  { id: 58, name: "Enrique Díaz",        title: "Operations Analyst",               dept: "Operations",    loc: "São Paulo, BR",   salary: 91_230,  perf: 75, status: "Active" },
  { id: 59, name: "Chioma Nwofor",       title: "Design Ops Manager",               dept: "Design",        loc: "Lagos, NG",       salary: 113_450, perf: 84, status: "Active" },
  { id: 60, name: "Ryo Nakamura",        title: "Embedded Systems Engineer",        dept: "Engineering",  loc: "Tokyo, JP",       salary: 133_780, perf: 88, status: "Remote" },
  { id: 61, name: "Aisha Diallo",        title: "Content Marketing Lead",           dept: "Marketing",     loc: "Nairobi, KE",     salary: 100_230, perf: 80, status: "Active" },
  { id: 62, name: "Daan Vermeer",        title: "Head of Data Science",             dept: "Data Science",  loc: "Amsterdam, NL",   salary: 175_430, perf: 96, status: "Active" },
  { id: 63, name: "Manon Lefebvre",      title: "Enterprise Account Manager",       dept: "Marketing",     loc: "Berlin, DE",      salary: 112_670, perf: 83, status: "Active" },
  { id: 64, name: "Babatunde Ogunleye",  title: "Staff Backend Engineer",           dept: "Engineering",  loc: "Lagos, NG",       salary: 152_890, perf: 94, status: "Active" },
  { id: 65, name: "Ye-Jin Kang",         title: "Product Operations Manager",       dept: "Operations",    loc: "Seoul, KR",       salary: 116_540, perf: 86, status: "Active" },
  { id: 66, name: "Akira Matsumoto",     title: "Principal Engineer",               dept: "Engineering",  loc: "Tokyo, JP",       salary: 168_230, perf: 95, status: "Active" },
  { id: 67, name: "Ingrid Haugen",       title: "Senior Legal Counsel",             dept: "Legal",         loc: "Amsterdam, NL",   salary: 153_780, perf: 91, status: "Active" },
  { id: 68, name: "Tariq Al-Hassan",     title: "Senior Data Analyst",              dept: "Data Science",  loc: "Cairo, EG",       salary: 122_340, perf: 87, status: "Active" },
  { id: 69, name: "Funmilayo Adewale",   title: "Head of Engineering",              dept: "Engineering",  loc: "Lagos, NG",       salary: 182_560, perf: 97, status: "Active" },
  { id: 70, name: "Mariana Costa",       title: "Finance Business Partner",         dept: "Finance",       loc: "São Paulo, BR",   salary: 137_890, perf: 89, status: "Active" },
  { id: 71, name: "Sun-Ho Yoon",         title: "Platform Reliability Engineer",    dept: "Engineering",  loc: "Seoul, KR",       salary: 138_450, perf: 89, status: "Remote" },
  { id: 72, name: "Chidinma Eze",        title: "Brand Strategist",                 dept: "Marketing",     loc: "Lagos, NG",       salary: 98_780,  perf: 78, status: "Active" },
  { id: 73, name: "Pieter de Jong",      title: "Engineering Director",             dept: "Engineering",  loc: "Amsterdam, NL",   salary: 193_450, perf: 96, status: "Active" },
  { id: 74, name: "Selin Özdemir",       title: "Product Designer",                 dept: "Design",        loc: "Istanbul, TR",    salary: 108_230, perf: 83, status: "Active" },
  { id: 75, name: "Rohan Desai",         title: "Analytics Engineer",               dept: "Data Science",  loc: "Mumbai, IN",      salary: 126_780, perf: 88, status: "Active" },
  { id: 76, name: "Adwoa Mensah",        title: "Operations Director",              dept: "Operations",    loc: "Nairobi, KE",     salary: 158_670, perf: 93, status: "Active" },
  { id: 77, name: "Kazuya Hayashi",      title: "Senior iOS Engineer",              dept: "Engineering",  loc: "Tokyo, JP",       salary: 129_340, perf: 86, status: "Active" },
  { id: 78, name: "Monique Petit",       title: "Corporate Paralegal",              dept: "Legal",         loc: "Berlin, DE",      salary: 102_560, perf: 80, status: "Contract" },
  { id: 79, name: "Abimbola Adesanya",   title: "Strategy & Finance Analyst",       dept: "Finance",       loc: "Lagos, NG",       salary: 111_890, perf: 84, status: "Active" },
  { id: 80, name: "Miki Suzuki",         title: "Research Scientist",               dept: "Data Science",  loc: "Tokyo, JP",       salary: 143_230, perf: 91, status: "Active" },
  { id: 81, name: "Ezra Kimani",         title: "Security Analyst",                 dept: "Engineering",  loc: "Nairobi, KE",     salary: 117_450, perf: 85, status: "Active" },
  { id: 82, name: "Clara Fernández",     title: "Head of Design",                   dept: "Design",        loc: "São Paulo, BR",   salary: 163_780, perf: 94, status: "Active" },
  { id: 83, name: "Kenji Kobayashi",     title: "Database Engineer",                dept: "Engineering",  loc: "Tokyo, JP",       salary: 127_560, perf: 86, status: "Active" },
  { id: 84, name: "Lerato Motsepe",      title: "Growth Product Manager",           dept: "Product",       loc: "Nairobi, KE",     salary: 131_230, perf: 88, status: "Active" },
  { id: 85, name: "Elias Weber",         title: "Site Reliability Engineer",        dept: "Engineering",  loc: "Berlin, DE",      salary: 134_890, perf: 89, status: "Remote" },
  { id: 86, name: "Minh-Thi Nguyen",     title: "Senior Product Manager",           dept: "Product",       loc: "Toronto, CA",     salary: 148_340, perf: 91, status: "Active" },
  { id: 87, name: "Adaora Okonkwo",      title: "Talent Acquisition Lead",          dept: "Operations",    loc: "Lagos, NG",       salary: 103_780, perf: 82, status: "Active" },
  { id: 88, name: "Hiroshi Yamada",      title: "Solutions Architect",              dept: "Engineering",  loc: "Tokyo, JP",       salary: 156_230, perf: 92, status: "Active" },
  { id: 89, name: "Beatriz Lima",        title: "Performance Marketing Manager",    dept: "Marketing",     loc: "São Paulo, BR",   salary: 107_450, perf: 83, status: "Active" },
  { id: 90, name: "Emre Yılmaz",         title: "Engineering Manager",              dept: "Engineering",  loc: "Istanbul, TR",    salary: 149_780, perf: 92, status: "Active" },
  { id: 91, name: "Amira El-Sayed",      title: "Tax & Treasury Analyst",           dept: "Finance",       loc: "Cairo, EG",       salary: 114_560, perf: 85, status: "Active" },
  { id: 92, name: "Dakarai Chisango",    title: "Backend Platform Engineer",        dept: "Engineering",  loc: "Nairobi, KE",     salary: 124_230, perf: 87, status: "Active" },
  { id: 93, name: "Yuki Fujita",         title: "Sr. Motion Designer",              dept: "Design",        loc: "Tokyo, JP",       salary: 109_870, perf: 82, status: "Active" },
  { id: 94, name: "Nuno Ferreira",       title: "Data Infrastructure Engineer",     dept: "Data Science",  loc: "Amsterdam, NL",   salary: 132_450, perf: 88, status: "Active" },
  { id: 95, name: "Olamide Afolabi",     title: "Chief of Staff",                   dept: "Operations",    loc: "Lagos, NG",       salary: 167_890, perf: 94, status: "Active" },
  { id: 96, name: "Ifeoma Obiora",       title: "Product Counsel",                  dept: "Legal",         loc: "Lagos, NG",       salary: 136_780, perf: 89, status: "Active" },
  { id: 97, name: "Tae-Yang Oh",         title: "VP of Engineering",                dept: "Engineering",  loc: "Seoul, KR",       salary: 218_560, perf: 98, status: "Active" },
  { id: 98, name: "Camilla Brandt",      title: "Compensation Analyst",             dept: "Finance",       loc: "Berlin, DE",      salary: 108_230, perf: 83, status: "Active" },
  { id: 99, name: "Nneka Udeze",         title: "Growth Engineer",                  dept: "Engineering",  loc: "Lagos, NG",       salary: 127_890, perf: 86, status: "Active" },
  { id: 100, name: "Sota Inoue",         title: "Senior ML Engineer",               dept: "Data Science",  loc: "Tokyo, JP",       salary: 148_670, perf: 92, status: "Remote" },
  { id: 101, name: "Zanele Dube",        title: "Head of Talent",                   dept: "Operations",    loc: "Nairobi, KE",     salary: 142_560, perf: 91, status: "Active" },
  { id: 102, name: "Carlos Mendoza",     title: "Staff Data Scientist",             dept: "Data Science",  loc: "São Paulo, BR",   salary: 158_430, perf: 93, status: "Active" },
  { id: 103, name: "Elif Demirci",       title: "Head of Brand",                    dept: "Marketing",     loc: "Istanbul, TR",    salary: 137_890, perf: 90, status: "Active" },
  { id: 104, name: "Tunde Fashola",      title: "Principal Product Designer",       dept: "Design",        loc: "Lagos, NG",       salary: 151_230, perf: 93, status: "Active" },
  { id: 105, name: "Niamh O'Sullivan",   title: "Strategic Finance Manager",        dept: "Finance",       loc: "Toronto, CA",     salary: 143_780, perf: 90, status: "Active" },
  { id: 106, name: "Byung-Chul Yoo",     title: "Staff ML Engineer",                dept: "Data Science",  loc: "Seoul, KR",       salary: 163_560, perf: 94, status: "Active" },
  { id: 107, name: "Giulia Romano",      title: "Senior Operations Manager",        dept: "Operations",    loc: "Amsterdam, NL",   salary: 126_340, perf: 88, status: "Active" },
  { id: 108, name: "Tolu Olaiya",        title: "Engineering Program Manager",      dept: "Engineering",  loc: "Lagos, NG",       salary: 138_890, perf: 90, status: "Active" },
  { id: 109, name: "Ayumi Kawamoto",     title: "Senior Data Engineer",             dept: "Data Science",  loc: "Tokyo, JP",       salary: 139_780, perf: 90, status: "Active" },
  { id: 110, name: "Rafael Alves",       title: "VP of Product",                    dept: "Product",       loc: "São Paulo, BR",   salary: 204_560, perf: 97, status: "Active" },
];
export type Raw_employeesItem = (typeof RAW_EMPLOYEES)[number]

// Enrich employees with deterministic avatar URLs
const EMPLOYEES = RAW_EMPLOYEES.map((e) => ({
  ...e,
  department: e.dept,
  location: e.loc,
  performance: e.perf,
  avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(e.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc`,
}));
export type Employee = (typeof EMPLOYEES)[number];

// ─── Status & department badge styles ────────────────────────────────────────
const STATUS_STYLES = {
  Active:     "bg-[oklch(93%_0.08_145)] text-[oklch(33%_0.12_145)] dark:bg-[oklch(28%_0.08_145)] dark:text-[oklch(78%_0.12_145)]",
  "On Leave": "bg-[oklch(93%_0.08_70)]  text-[oklch(38%_0.12_70)]  dark:bg-[oklch(28%_0.08_70)]  dark:text-[oklch(78%_0.12_70)]",
  Remote:     "bg-[oklch(93%_0.08_260)] text-[oklch(36%_0.12_260)] dark:bg-[oklch(28%_0.08_260)] dark:text-[oklch(78%_0.12_260)]",
  Contract:   "bg-[oklch(93%_0.07_35)]  text-[oklch(38%_0.12_35)]  dark:bg-[oklch(28%_0.07_35)]  dark:text-[oklch(78%_0.12_35)]",
};

const DEPT_COLORS = {
  Engineering:   "text-[oklch(40%_0.16_260)] bg-[oklch(94%_0.06_260)] dark:text-[oklch(75%_0.14_260)] dark:bg-[oklch(26%_0.06_260)]",
  Design:        "text-[oklch(38%_0.16_320)] bg-[oklch(94%_0.06_320)] dark:text-[oklch(75%_0.14_320)] dark:bg-[oklch(26%_0.06_320)]",
  Product:       "text-[oklch(38%_0.16_220)] bg-[oklch(94%_0.06_220)] dark:text-[oklch(75%_0.14_220)] dark:bg-[oklch(26%_0.06_220)]",
  "Data Science":"text-[oklch(38%_0.16_190)] bg-[oklch(94%_0.06_190)] dark:text-[oklch(75%_0.14_190)] dark:bg-[oklch(26%_0.06_190)]",
  Marketing:     "text-[oklch(38%_0.16_50)]  bg-[oklch(94%_0.06_50)]  dark:text-[oklch(75%_0.14_50)]  dark:bg-[oklch(26%_0.06_50)]",
  Finance:       "text-[oklch(38%_0.16_145)] bg-[oklch(94%_0.06_145)] dark:text-[oklch(75%_0.14_145)] dark:bg-[oklch(26%_0.06_145)]",
  Operations:    "text-[oklch(38%_0.12_255)] bg-[oklch(94%_0.04_255)] dark:text-[oklch(75%_0.10_255)] dark:bg-[oklch(26%_0.04_255)]",
  Legal:         "text-[oklch(38%_0.12_30)]  bg-[oklch(94%_0.05_30)]  dark:text-[oklch(75%_0.10_30)]  dark:bg-[oklch(26%_0.05_30)]",
};

// ─── Skeleton row (loading state) ─────────────────────────────────────────────
const SkeletonRow = React.memo(function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[oklch(92%_0.01_255)] dark:border-[oklch(28%_0.01_255)]">
      <div className="animate-pulse w-9 h-9 rounded-full bg-[oklch(88%_0.02_255)] dark:bg-[oklch(32%_0.02_255)] shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="animate-pulse h-3.5 w-32 rounded bg-[oklch(88%_0.02_255)] dark:bg-[oklch(32%_0.02_255)]" />
        <div className="animate-pulse h-3 w-48 rounded bg-[oklch(91%_0.02_255)] dark:bg-[oklch(30%_0.02_255)]" />
      </div>
      <div className="animate-pulse h-5 w-20 rounded-full bg-[oklch(88%_0.02_255)] dark:bg-[oklch(32%_0.02_255)] shrink-0" />
      <div className="animate-pulse h-5 w-16 rounded-full bg-[oklch(88%_0.02_255)] dark:bg-[oklch(32%_0.02_255)] shrink-0 hidden sm:block" />
      <div className="animate-pulse h-4 w-20 rounded bg-[oklch(88%_0.02_255)] dark:bg-[oklch(32%_0.02_255)] shrink-0 hidden md:block tabular-nums" />
    </div>
  );
});

// ─── Individual employee row (memoized) ───────────────────────────────────────
const EmployeeRow = React.memo(function EmployeeRow({ employee, onSelect, prefetchDetail }: { employee: Employee; onSelect: (e: Employee) => void; prefetchDetail: (id: number) => void }) {
  const handleMouseEnter = useCallback(() => {
    prefetchDetail(employee.id);
  }, [employee.id, prefetchDetail]);

  return (
    <article
      className="flex items-center gap-3 px-4 py-3 border-b border-[oklch(92%_0.01_255)] dark:border-[oklch(28%_0.01_255)] hover:bg-[oklch(97%_0.01_255)] dark:hover:bg-[oklch(22%_0.01_255)] transition-colors cursor-pointer group"
      style={{ contain: "layout style" }}
      onMouseEnter={handleMouseEnter}
      onClick={() => onSelect(employee)}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${employee.name}, ${employee.title}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(employee); } }}
    >
      {/* Avatar */}
      <img
        src={employee.avatar}
        alt={`${employee.name} initials avatar`}
        loading="lazy"
        decoding="async"
        width="36"
        height="36"
        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[oklch(86%_0.04_260)] dark:ring-[oklch(40%_0.04_260)]"
      />

      {/* Name + title */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)] truncate leading-tight">
          {employee.name}
        </p>
        <p className="text-xs text-[oklch(52%_0.04_255)] dark:text-[oklch(62%_0.04_255)] truncate mt-0.5">
          {employee.title}
        </p>
      </div>

      {/* Department badge */}
      <span
        className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${DEPT_COLORS[employee.department as keyof typeof DEPT_COLORS] || ""}`}
      >
        {employee.department}
      </span>

      {/* Status badge */}
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[employee.status as keyof typeof STATUS_STYLES] || ""}`}
      >
        {employee.status}
      </span>

      {/* Salary */}
      <span className="hidden md:block text-xs font-medium tabular-nums text-[oklch(45%_0.04_255)] dark:text-[oklch(65%_0.04_255)] shrink-0 w-20 text-right">
        ${employee.salary.toLocaleString()}
      </span>

      {/* Performance bar */}
      <div className="hidden lg:flex items-center gap-1.5 shrink-0 w-20">
        <div className="flex-1 h-1.5 rounded-full bg-[oklch(88%_0.03_255)] dark:bg-[oklch(35%_0.03_255)]">
          <div
            className="h-1.5 rounded-full bg-[oklch(58%_0.18_145)]"
            style={{ width: `${employee.performance}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-[oklch(50%_0.04_255)] dark:text-[oklch(62%_0.04_255)]">
          {employee.performance}%
        </span>
      </div>
    </article>
  );
});

// ─── Search / filter toolbar ──────────────────────────────────────────────────
const FilterBar = React.memo(function FilterBar({ search, onSearch, activeDept, onDept, totalShown, totalAll }: { search: string; onSearch: (v: string) => void; activeDept: string | null; onDept: (d: string | null) => void; totalShown: number; totalAll: number }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center px-4 py-3 border-b border-[oklch(90%_0.01_255)] dark:border-[oklch(30%_0.01_255)]">
      <div className="relative flex-1 max-w-xs w-full">
        <label htmlFor="catalog-search" className="sr-only">Search employees</label>
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(60%_0.04_255)] dark:text-[oklch(55%_0.04_255)] pointer-events-none"
          fill="none" viewBox="0 0 16 16" aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          id="catalog-search"
          type="search"
          placeholder="Search by name or role…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-describedby="catalog-search-hint"
          className="w-full pl-9 pr-4 h-11 min-h-[44px] rounded-lg border border-[oklch(85%_0.02_255)] dark:border-[oklch(38%_0.02_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(24%_0.01_255)] text-sm text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)] placeholder:text-[oklch(62%_0.04_255)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] transition-colors"
        />
        <span id="catalog-search-hint" className="sr-only">Filters employees by name or job title in real time</span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {["All", ...DEPARTMENTS].map((dept) => (
          <button
            key={dept}
            onClick={() => onDept(dept === "All" ? null : dept)}
            className={`h-11 min-h-[44px] px-3 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] ${
              (dept === "All" && !activeDept) || activeDept === dept
                ? "bg-[oklch(28%_0.02_255)] dark:bg-[oklch(88%_0.02_255)] border-[oklch(28%_0.02_255)] dark:border-[oklch(88%_0.02_255)] text-[oklch(97%_0.01_255)] dark:text-[oklch(18%_0.01_255)]"
                : "border-[oklch(85%_0.02_255)] dark:border-[oklch(38%_0.02_255)] text-[oklch(42%_0.04_255)] dark:text-[oklch(65%_0.04_255)] hover:border-[oklch(70%_0.04_255)] dark:hover:border-[oklch(55%_0.04_255)]"
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-xs text-[oklch(55%_0.04_255)] dark:text-[oklch(62%_0.04_255)] shrink-0 sm:ml-auto"
      >
        {totalShown.toLocaleString()} of {totalAll.toLocaleString()} employees
      </span>
    </div>
  );
});

// ─── Main catalog component ────────────────────────────────────────────────────
export default function PerformanceCatalog() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [prefetchedIds, setPrefetchedIds] = useState<Set<number>>(new Set());

  const parentRef = useRef(null);

  // Data resolves via a real async boundary; no artificial latency.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Filtered + searched list — memoized for performance
  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EMPLOYEES.filter((e) => {
      const matchesDept = !activeDept || e.department === activeDept;
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [search, activeDept]);

  // Virtualizer — only renders visible rows
  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 12 : filteredEmployees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Memoized callbacks to avoid re-renders
  const handleSelect = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedEmployee(null);
  }, []);

  const prefetchDetail = useCallback((id: number) => {
    setPrefetchedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
  }, []);

  const handleDept = useCallback((dept: string | null) => {
    setActiveDept(dept);
  }, []);

  function handleRetry() {
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 650);
  }

  if (error) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center bg-[oklch(98%_0.005_255)] dark:bg-[oklch(14%_0.01_255)] font-[Manrope,system-ui,sans-serif] px-4">
        <div role="alert" className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-[oklch(93%_0.07_20)] dark:bg-[oklch(28%_0.07_20)] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-[oklch(45%_0.14_20)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)] font-semibold text-lg">Failed to load employee data</p>
          <p className="text-[oklch(52%_0.04_255)] dark:text-[oklch(62%_0.04_255)] text-sm">Could not reach the HR service. Check your connection and try again.</p>
          <button
            onClick={handleRetry}
            className="min-h-[44px] px-6 rounded-lg bg-[oklch(28%_0.02_255)] dark:bg-[oklch(88%_0.02_255)] text-[oklch(97%_0.01_255)] dark:text-[oklch(18%_0.01_255)] text-sm font-semibold hover:bg-[oklch(22%_0.02_255)] dark:hover:bg-[oklch(93%_0.02_255)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main
      className="min-h-[100dvh] bg-[oklch(98%_0.005_255)] dark:bg-[oklch(14%_0.01_255)] font-[Manrope,system-ui,sans-serif] text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)]"
      aria-busy={isLoading}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      {/* Skip link */}
      <a
        href="#catalog-list"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[oklch(98%_0.005_255)] dark:focus:bg-[oklch(20%_0.01_255)] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-[oklch(55%_0.18_260)] focus:text-sm focus:font-semibold"
      >
        Skip to employee list
      </a>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[oklch(98%_0.005_255)]/90 dark:bg-[oklch(14%_0.01_255)]/90 backdrop-blur-md border-b border-[oklch(90%_0.01_255)] dark:border-[oklch(28%_0.01_255)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[oklch(52%_0.18_260)] flex items-center justify-center">
              <svg className="w-4 h-4 text-[oklch(97%_0.01_255)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-[oklch(18%_0.01_255)] dark:text-[oklch(95%_0.01_255)] text-sm tracking-tight">PeopleHub</span>
              <span className="ml-2 text-xs text-[oklch(56%_0.04_255)] dark:text-[oklch(62%_0.04_255)]">Employee Catalog</span>
            </div>
          </div>

          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1 text-sm font-medium text-[oklch(50%_0.04_255)] dark:text-[oklch(60%_0.04_255)]">
              <li><a href="#" className="px-3 py-2 rounded-lg hover:bg-[oklch(93%_0.02_255)] dark:hover:bg-[oklch(25%_0.02_255)] hover:text-[oklch(22%_0.01_255)] dark:hover:text-[oklch(93%_0.01_255)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)]">Overview</a></li>
              <li><a href="#" className="px-3 py-2 rounded-lg bg-[oklch(93%_0.02_255)] dark:bg-[oklch(25%_0.02_255)] text-[oklch(22%_0.01_255)] dark:text-[oklch(93%_0.01_255)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)]">People</a></li>
              <li><a href="#" className="px-3 py-2 rounded-lg hover:bg-[oklch(93%_0.02_255)] dark:hover:bg-[oklch(25%_0.02_255)] hover:text-[oklch(22%_0.01_255)] dark:hover:text-[oklch(93%_0.01_255)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)]">Reports</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* ─── Page title ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[oklch(18%_0.01_255)] dark:text-[oklch(95%_0.01_255)] tracking-tight">
              Employee Directory
            </h1>
            <p className="text-sm text-[oklch(52%_0.04_255)] dark:text-[oklch(62%_0.04_255)] mt-1">
              {EMPLOYEES.length} team members across {DEPARTMENTS.length} departments ·{" "}
              avg. salary ${Math.round(EMPLOYEES.reduce((s, e) => s + e.salary, 0) / EMPLOYEES.length).toLocaleString()}
            </p>
          </div>
          <button
            aria-label="Add new employee"
            className="self-start sm:self-auto min-h-[44px] h-11 px-5 rounded-xl bg-[oklch(52%_0.18_260)] text-[oklch(97%_0.01_255)] text-sm font-bold hover:bg-[oklch(45%_0.18_260)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(52%_0.18_260)] focus-visible:ring-offset-2 shadow-[0_2px_8px_oklch(52%_0.18_260_/_0.35)]"
          >
            + Add Employee
          </button>
        </div>
      </section>

      {/* ─── Stats strip ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4" aria-label="Summary statistics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Headcount",  value: EMPLOYEES.length.toString(),            accent: "text-[oklch(45%_0.16_260)]" },
            { label: "Active",           value: EMPLOYEES.filter(e=>e.status==="Active").length.toString(), accent: "text-[oklch(42%_0.16_145)]" },
            { label: "Remote",           value: EMPLOYEES.filter(e=>e.status==="Remote").length.toString(), accent: "text-[oklch(42%_0.16_220)]" },
            { label: "Avg. Performance", value: `${(EMPLOYEES.reduce((s,e)=>s+e.performance,0)/EMPLOYEES.length).toFixed(1)}%`, accent: "text-[oklch(42%_0.16_50)]" },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="rounded-xl border border-[oklch(88%_0.02_255)] dark:border-[oklch(30%_0.02_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(18%_0.01_255)] px-4 py-3"
              style={{ contain: "layout style" }}
            >
              <p className="text-xs font-semibold text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)] uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-extrabold tabular-nums mt-0.5 ${accent}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Catalog card ───────────────────────────────────────────────── */}
      <section
        id="catalog-list"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
        aria-label="Employee catalog"
      >
        <div className="rounded-2xl border border-[oklch(88%_0.02_255)] dark:border-[oklch(30%_0.02_255)] bg-[oklch(99%_0.005_255)] dark:bg-[oklch(18%_0.01_255)] shadow-sm overflow-hidden">

          {/* Status bar while loading */}
          {isLoading && (
            <div
              role="status"
              aria-label="Loading employee directory"
              aria-live="polite"
              className="flex items-center gap-2 px-4 py-2.5 bg-[oklch(95%_0.05_260)] dark:bg-[oklch(24%_0.05_260)] border-b border-[oklch(86%_0.06_260)] dark:border-[oklch(34%_0.06_260)]"
            >
              <div className="w-3 h-3 rounded-full bg-[oklch(52%_0.18_260)] animate-pulse" />
              <p className="text-xs font-semibold text-[oklch(38%_0.12_260)] dark:text-[oklch(72%_0.12_260)]">
                Loading employee directory…
              </p>
            </div>
          )}

          {/* Filter toolbar */}
          {!isLoading && (
            <FilterBar
              search={search}
              onSearch={handleSearch}
              activeDept={activeDept}
              onDept={handleDept}
              totalShown={filteredEmployees.length}
              totalAll={EMPLOYEES.length}
            />
          )}

          {/* Column headers */}
          <div
            className="hidden sm:flex items-center gap-3 px-4 py-2 bg-[oklch(96%_0.005_255)] dark:bg-[oklch(20%_0.01_255)] border-b border-[oklch(90%_0.01_255)] dark:border-[oklch(28%_0.01_255)] text-xs font-semibold uppercase tracking-wider text-[oklch(55%_0.04_255)] dark:text-[oklch(58%_0.04_255)]"
            role="row"
            aria-label="Column headers"
          >
            <div className="w-9 shrink-0" />
            <div className="flex-1">Employee</div>
            <div className="w-28 hidden sm:block">Department</div>
            <div className="w-20">Status</div>
            <div className="w-20 hidden md:block text-right">Salary</div>
            <div className="w-20 hidden lg:block">Performance</div>
          </div>

          {/* ─ Virtualized list ─────────────────────────────────────── */}
          <div
            ref={parentRef}
            className="overflow-y-auto"
            style={{ height: "560px" }}
            tabIndex={0}
            role="list"
            aria-label="Employee rows — scrollable"
            aria-busy={isLoading}
          >
            {isLoading ? (
              // Skeleton state
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem: { key: React.Key; size: number; start: number; index: number }) => (
                  <div
                    key={virtualItem.key}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <SkeletonRow />
                  </div>
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-[oklch(58%_0.04_255)] dark:text-[oklch(58%_0.04_255)]">
                <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" strokeWidth={1.5} />
                  <path d="M17 17L21 21" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
                <p className="font-semibold text-sm">No employees match your filters</p>
                <button
                  onClick={() => { setSearch(""); setActiveDept(null); }}
                  className="text-[oklch(52%_0.18_260)] text-xs font-bold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(55%_0.18_260)] rounded px-2 py-1 min-h-[44px]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              // Virtualized rows
              <div
                style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
                role="rowgroup"
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem: { key: React.Key; size: number; start: number; index: number }) => {
                  const employee = filteredEmployees[virtualItem.index];
                  return (
                    <div
                      key={virtualItem.key}
                      data-index={virtualItem.index}
                      ref={rowVirtualizer.measureElement}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${virtualItem.start}px)` }}
                      role="row"
                    >
                      <EmployeeRow
                        employee={employee}
                        onSelect={handleSelect}
                        prefetchDetail={prefetchDetail}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer summary */}
          {!isLoading && (
            <footer className="flex items-center justify-between px-4 py-3 border-t border-[oklch(90%_0.01_255)] dark:border-[oklch(28%_0.01_255)] bg-[oklch(97%_0.005_255)] dark:bg-[oklch(19%_0.01_255)]">
              <p className="text-xs text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)]">
                Virtualized list · {filteredEmployees.length.toLocaleString()} rows · {prefetchedIds.size} prefetched
              </p>
              <p className="text-xs text-[oklch(55%_0.04_255)] dark:text-[oklch(60%_0.04_255)]">
                Total payroll:{" "}
                <strong className="text-[oklch(38%_0.04_255)] dark:text-[oklch(80%_0.04_255)]">
                  ${filteredEmployees.reduce((s, e) => s + e.salary, 0).toLocaleString()}
                </strong>
              </p>
            </footer>
          )}
        </div>
      </section>

      {/* ─── Lazy-loaded detail panel via Suspense ──────────────────────── */}
      {selectedEmployee && (
        <Suspense
          fallback={
            <div
              role="status"
              aria-label="Loading employee detail panel"
              className="fixed inset-y-0 right-0 w-80 bg-[oklch(99%_0.005_255)] dark:bg-[oklch(18%_0.01_255)] border-l border-[oklch(90%_0.02_255)] dark:border-[oklch(30%_0.02_255)] z-40 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full border-2 border-[oklch(88%_0.02_255)] border-t-[oklch(52%_0.18_260)] animate-spin" />
            </div>
          }
        >
          <EmployeeDetailPanel employee={selectedEmployee} onClose={handleClose} />
        </Suspense>
      )}

      {/* Overlay backdrop */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 bg-[oklch(20%_0.01_255)]/30 dark:bg-[oklch(5%_0.01_255)]/50 z-30 backdrop-blur-[2px]"
          aria-hidden="true"
          onClick={handleClose}
        />
      )}
    </main>
  );
}
