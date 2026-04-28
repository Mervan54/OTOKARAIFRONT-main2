import type { Directorate, UniqueTask, ChatbotContext, AIInsight, AIAnalysisResponse, SolutionType } from "./types"

export const mockDirectorates: Directorate[] = [
  {
    id: "dir-1",
    name: "Insan Kaynaklari Direktorlugu",
    totalRecords: 156,
    departmentCount: 4,
    departments: [
      {
        id: "dept-1",
        name: "Ise Alim",
        taskCount: 42,
        goals: ["Yetenek kazanimi", "Ise alim sureclerinin optimizasyonu"],
        skills: ["Mulakat teknikleri", "Aday degerlendirme", "IK yazilimlari"],
        responsibilities: ["Aday tarama", "Mulakat planlama", "Teklif yonetimi"],
      },
      {
        id: "dept-2",
        name: "Egitim ve Gelisim",
        taskCount: 38,
        goals: ["Calisan gelisimi", "Yetkinlik artirimi"],
        skills: ["Egitim tasarimi", "Performans degerlendirme"],
        responsibilities: ["Egitim programlari", "Kariyer planlama"],
      },
      {
        id: "dept-3",
        name: "Bordro ve Ozluk",
        taskCount: 45,
        goals: ["Dogru ve zamaninda odeme", "Yasal uyumluluk"],
        skills: ["Bordro sistemleri", "Is hukuku bilgisi"],
        responsibilities: ["Maas hesaplama", "SGK islemleri", "Izin takibi"],
      },
      {
        id: "dept-4",
        name: "Calisan Iliskileri",
        taskCount: 31,
        goals: ["Calisan memnuniyeti", "Ic iletisim"],
        skills: ["Catisma cozumu", "Iletisim becerileri"],
        responsibilities: ["Sikayet yonetimi", "Etkinlik organizasyonu"],
      },
    ],
  },
  {
    id: "dir-2",
    name: "Bilgi Teknolojileri Direktorlugu",
    totalRecords: 203,
    departmentCount: 5,
    departments: [
      {
        id: "dept-5",
        name: "Yazilim Gelistirme",
        taskCount: 67,
        goals: ["Kaliteli yazilim uretimi", "Zamaninda teslimat"],
        skills: ["Programlama dilleri", "Agile metodolojileri", "DevOps"],
        responsibilities: ["Kod gelistirme", "Test otomasyonu", "Deployment"],
      },
      {
        id: "dept-6",
        name: "Sistem Yonetimi",
        taskCount: 52,
        goals: ["Sistem surekliligi", "Performans optimizasyonu"],
        skills: ["Linux/Windows yonetimi", "Bulut teknolojileri"],
        responsibilities: ["Sunucu bakimi", "Yedekleme", "Guvenlik yamalari"],
      },
      {
        id: "dept-7",
        name: "Ag Guvenligi",
        taskCount: 38,
        goals: ["Siber guvenlik", "Veri koruma"],
        skills: ["Firewall yonetimi", "Penetrasyon testi"],
        responsibilities: ["Guvenlik izleme", "Tehdit analizi"],
      },
      {
        id: "dept-8",
        name: "Teknik Destek",
        taskCount: 28,
        goals: ["Hizli cozum", "Kullanici memnuniyeti"],
        skills: ["Sorun giderme", "Musteri hizmetleri"],
        responsibilities: ["Destek talepleri", "Donanim bakimi"],
      },
      {
        id: "dept-9",
        name: "Veri Analitigi",
        taskCount: 18,
        goals: ["Veri odakli karar alma", "Is zekasi"],
        skills: ["SQL", "Python", "BI araclari"],
        responsibilities: ["Raporlama", "Dashboard gelistirme"],
      },
    ],
  },
  {
    id: "dir-3",
    name: "Finans Direktorlugu",
    totalRecords: 142,
    departmentCount: 4,
    departments: [
      {
        id: "dept-10",
        name: "Muhasebe",
        taskCount: 48,
        goals: ["Dogru finansal raporlama", "Yasal uyumluluk"],
        skills: ["Muhasebe standartlari", "ERP sistemleri"],
        responsibilities: ["Kayit tutma", "Mizan hazirlama", "Denetim destegi"],
      },
      {
        id: "dept-11",
        name: "Butce Planlama",
        taskCount: 32,
        goals: ["Etkin kaynak kullanimi", "Maliyet kontrolu"],
        skills: ["Finansal modelleme", "Tahminleme"],
        responsibilities: ["Butce hazirlama", "Varyans analizi"],
      },
      {
        id: "dept-12",
        name: "Hazine",
        taskCount: 28,
        goals: ["Nakit akisi yonetimi", "Risk minimizasyonu"],
        skills: ["Likidite yonetimi", "Forex bilgisi"],
        responsibilities: ["Odeme planlamasi", "Banka iliskileri"],
      },
      {
        id: "dept-13",
        name: "Vergi",
        taskCount: 34,
        goals: ["Vergi optimizasyonu", "Yasal uyumluluk"],
        skills: ["Vergi mevzuati", "Beyanname hazirlama"],
        responsibilities: ["Vergi hesaplama", "Beyanname gonderimi"],
      },
    ],
  },
  {
    id: "dir-4",
    name: "Pazarlama Direktorlugu",
    totalRecords: 98,
    departmentCount: 3,
    departments: [
      {
        id: "dept-14",
        name: "Dijital Pazarlama",
        taskCount: 42,
        goals: ["Online gorunurluk", "Lead uretimi"],
        skills: ["SEO/SEM", "Sosyal medya yonetimi", "Google Analytics"],
        responsibilities: ["Kampanya yonetimi", "Icerik uretimi", "Performans analizi"],
      },
      {
        id: "dept-15",
        name: "Marka Yonetimi",
        taskCount: 28,
        goals: ["Marka bilirligi", "Marka degeri artisi"],
        skills: ["Marka stratejisi", "Gorsel iletisim"],
        responsibilities: ["Marka kilavuzu", "Kurumsal kimlik"],
      },
      {
        id: "dept-16",
        name: "Etkinlik Yonetimi",
        taskCount: 28,
        goals: ["Basarili etkinlikler", "Sponsor iliskileri"],
        skills: ["Proje yonetimi", "Lojistik koordinasyon"],
        responsibilities: ["Etkinlik planlama", "Butce yonetimi"],
      },
    ],
  },
  {
    id: "dir-5",
    name: "Operasyon Direktorlugu",
    totalRecords: 187,
    departmentCount: 4,
    departments: [
      {
        id: "dept-17",
        name: "Uretim",
        taskCount: 62,
        goals: ["Verimlilik artisi", "Kalite standartlari"],
        skills: ["Lean uretim", "Kalite kontrol"],
        responsibilities: ["Uretim planlama", "Makine bakimi"],
      },
      {
        id: "dept-18",
        name: "Tedarik Zinciri",
        taskCount: 48,
        goals: ["Optimum stok seviyesi", "Tedarikci yonetimi"],
        skills: ["Envanter yonetimi", "Satin alma"],
        responsibilities: ["Siparis yonetimi", "Lojistik koordinasyon"],
      },
      {
        id: "dept-19",
        name: "Kalite Guvence",
        taskCount: 38,
        goals: ["Sifir hata", "Surekli iyilestirme"],
        skills: ["ISO standartlari", "Istatistiksel analiz"],
        responsibilities: ["Kalite denetimi", "Duzeltici faaliyetler"],
      },
      {
        id: "dept-20",
        name: "Tesis Yonetimi",
        taskCount: 39,
        goals: ["Guvenli calisma ortami", "Enerji verimliligi"],
        skills: ["Bakim planlamasi", "ISG bilgisi"],
        responsibilities: ["Bina bakimi", "Guvenlik sistemleri"],
      },
    ],
  },
]

const solutionTypes: SolutionType[] = ["AI", "RPA", "Hybrid", "Other"]

export const mockUniqueTasks: UniqueTask[] = [
  { 
    id: "task-1", 
    name: "Raporlama", 
    departments: ["Muhasebe", "Veri Analitigi", "Butce Planlama", "Dijital Pazarlama"], 
    frequency: 4,
    solutionType: "RPA",
    automationRate: 85,
    recommendation: "Tekrarli raporlama surecleri RPA ile otomatize edilebilir"
  },
  { 
    id: "task-2", 
    name: "Butce yonetimi", 
    departments: ["Butce Planlama", "Etkinlik Yonetimi", "Pazarlama"], 
    frequency: 3,
    solutionType: "Hybrid",
    automationRate: 60,
    recommendation: "Butce takibi RPA, analiz AI ile desteklenebilir"
  },
  { 
    id: "task-3", 
    name: "Proje takibi", 
    departments: ["Yazilim Gelistirme", "Uretim", "Dijital Pazarlama"], 
    frequency: 3,
    solutionType: "AI",
    automationRate: 70,
    recommendation: "AI tabanli proje yonetim araclari ile optimize edilebilir"
  },
  { 
    id: "task-4", 
    name: "Egitim planlama", 
    departments: ["Egitim ve Gelisim", "Teknik Destek"], 
    frequency: 2,
    solutionType: "AI",
    automationRate: 55,
    recommendation: "AI ile kisisellestirilmis egitim onerileri sunulabilir"
  },
  { 
    id: "task-5", 
    name: "Performans degerlendirme", 
    departments: ["Ise Alim", "Egitim ve Gelisim", "Kalite Guvence"], 
    frequency: 3,
    solutionType: "Hybrid",
    automationRate: 65,
    recommendation: "Veri toplama RPA, analiz AI ile yapilabilir"
  },
  { 
    id: "task-6", 
    name: "Veri analizi", 
    departments: ["Veri Analitigi", "Dijital Pazarlama", "Finans"], 
    frequency: 3,
    solutionType: "AI",
    automationRate: 80,
    recommendation: "Ileri analitik ve tahminleme icin AI idealdir"
  },
  { 
    id: "task-7", 
    name: "Dokumantasyon", 
    departments: ["Yazilim Gelistirme", "Kalite Guvence", "Muhasebe", "IK"], 
    frequency: 4,
    solutionType: "RPA",
    automationRate: 75,
    recommendation: "Sablon bazli dokumantasyon RPA ile hizlandiriabilir"
  },
  { 
    id: "task-8", 
    name: "Musteri iletisimi", 
    departments: ["Teknik Destek", "Satis", "Pazarlama"], 
    frequency: 3,
    solutionType: "AI",
    automationRate: 50,
    recommendation: "Chatbot ve AI asistanlar ile desteklenebilir"
  },
  { 
    id: "task-9", 
    name: "Surec iyilestirme", 
    departments: ["Operasyon", "Kalite Guvence", "IT"], 
    frequency: 3,
    solutionType: "Hybrid",
    automationRate: 45,
    recommendation: "Surec madenciligi AI, uygulama RPA ile yapilabilir"
  },
  { 
    id: "task-10", 
    name: "Risk degerlendirme", 
    departments: ["Ag Guvenligi", "Finans", "Operasyon"], 
    frequency: 3,
    solutionType: "AI",
    automationRate: 75,
    recommendation: "Makine ogrenmesi ile risk skorlama yapilabilir"
  },
  { 
    id: "task-11", 
    name: "Tedarikci yonetimi", 
    departments: ["Tedarik Zinciri", "Satin Alma"], 
    frequency: 2,
    solutionType: "RPA",
    automationRate: 70,
    recommendation: "Siparis ve takip surecleri RPA ile otomatize edilebilir"
  },
  { 
    id: "task-12", 
    name: "Yasal uyumluluk", 
    departments: ["Vergi", "Muhasebe", "IK"], 
    frequency: 3,
    solutionType: "Hybrid",
    automationRate: 55,
    recommendation: "Kontrol listeleri RPA, yorumlama AI ile yapilabilir"
  },
  { 
    id: "task-13", 
    name: "Ic denetim", 
    departments: ["Finans", "Operasyon"], 
    frequency: 2,
    solutionType: "AI",
    automationRate: 60,
    recommendation: "Anomali tespiti icin AI kullanilabilir"
  },
  { 
    id: "task-14", 
    name: "Sistem bakimi", 
    departments: ["Sistem Yonetimi", "Tesis Yonetimi"], 
    frequency: 2,
    solutionType: "RPA",
    automationRate: 80,
    recommendation: "Rutin bakim gorevleri RPA ile zamanlanabilir"
  },
  { 
    id: "task-15", 
    name: "Guvenlik izleme", 
    departments: ["Ag Guvenligi", "Tesis Yonetimi"], 
    frequency: 2,
    solutionType: "AI",
    automationRate: 85,
    recommendation: "Tehdit tespiti icin AI tabanli SIEM onerilir"
  },
  { 
    id: "task-16", 
    name: "Icerik uretimi", 
    departments: ["Dijital Pazarlama", "Marka Yonetimi"], 
    frequency: 2,
    solutionType: "AI",
    automationRate: 40,
    recommendation: "Generative AI ile icerik onerileri uretillebilir"
  },
  { 
    id: "task-17", 
    name: "Kampanya yonetimi", 
    departments: ["Dijital Pazarlama", "Marka Yonetimi", "Satis"], 
    frequency: 3,
    solutionType: "Hybrid",
    automationRate: 65,
    recommendation: "Hedefleme AI, dagitim RPA ile yapilabilir"
  },
  { 
    id: "task-18", 
    name: "Envanter kontrolu", 
    departments: ["Tedarik Zinciri", "Uretim"], 
    frequency: 2,
    solutionType: "RPA",
    automationRate: 90,
    recommendation: "Stok takibi ve uyarilar RPA icin cok uygun"
  },
  { 
    id: "task-19", 
    name: "Maliyet analizi", 
    departments: ["Butce Planlama", "Uretim", "Tedarik Zinciri"], 
    frequency: 3,
    solutionType: "AI",
    automationRate: 70,
    recommendation: "Tahminleme ve optimizasyon icin AI onerilir"
  },
  { 
    id: "task-20", 
    name: "Toplanti organizasyonu", 
    departments: ["Etkinlik Yonetimi", "IK", "Yonetim Asistanligi"], 
    frequency: 3,
    solutionType: "RPA",
    automationRate: 75,
    recommendation: "Takvim ve davet yonetimi RPA ile otomatize edilebilir"
  },
]

export const mockChatbotContext: ChatbotContext = {
  totalDirectorates: 5,
  totalDepartments: 20,
  totalTasks: 786,
}

export const mockAIInsights: AIInsight[] = [
  {
    id: "insight-1",
    title: "En Yogun Direktorluk",
    value: "Bilgi Teknolojileri",
    description: "203 kayit ile en fazla is yukune sahip",
    type: "directorate",
  },
  {
    id: "insight-2",
    title: "En Cok Gorev Alan Mudurluk",
    value: "Yazilim Gelistirme",
    description: "67 gorev ile lider konumda",
    type: "department",
  },
  {
    id: "insight-3",
    title: "En Cok Tekrar Eden Gorev",
    value: "Raporlama",
    description: "4 farkli departmanda ortak kullaniliyor",
    type: "task",
  },
  {
    id: "insight-4",
    title: "Otomasyona En Uygun Alan",
    value: "Bordro Islemleri",
    description: "%85 otomasyon potansiyeli ile RPA icin ideal",
    type: "automation",
  },
]

export const mockAIAnalysis = (directorate: string): AIAnalysisResponse => ({
  directorate,
  tasks: [
    {
      task: "Raporlama",
      departments: ["Muhasebe", "Veri Analitigi"],
      bestSolution: "RPA",
      automationRate: 85,
      recommendation: "Tekrarli raporlama surecleri RPA ile otomatize edilebilir",
    },
    {
      task: "Veri Girisi",
      departments: ["Tum Departmanlar"],
      bestSolution: "RPA",
      automationRate: 95,
      recommendation: "Manuel veri girisi islemleri tamamen otomatize edilebilir",
    },
    {
      task: "Dokuman Isleme",
      departments: ["IK", "Finans"],
      bestSolution: "AI",
      automationRate: 75,
      recommendation: "OCR ve NLP ile dokuman isleme otomatize edilebilir",
    },
  ],
})

export const mockChatResponses: Record<string, string> = {
  default: "Sorunuzu analiz ettim. Bu konuda size yardimci olmak icin daha fazla bilgiye ihtiyacim var. Lutfen sorunuzu detaylandirir misiniz?",
  direktörlük: "Sistemde toplam 5 direktorluk bulunmaktadir: Insan Kaynaklari, Bilgi Teknolojileri, Finans, Pazarlama ve Operasyon Direktorlukleri. En fazla gorev Bilgi Teknolojileri Direktorlugu'nde (203 gorev) bulunmaktadir.",
  departman: "Toplam 20 departman aktif olarak calismaktadir. Her direktorluk altinda 3-5 arasi departman yer almaktadir. En kalabalik direktorluk 5 departman ile BT Direktorlugu'dur.",
  görev: "Sistemde toplam 786 gorev tanimlanmistir. En yaygin gorevler arasinda Raporlama, Dokumantasyon ve Proje takibi yer almaktadir. Bu gorevler birden fazla departmanda ortak olarak kullanilmaktadir.",
  analiz: "Gorev analizi sonuclarina gore, departmanlar arasi en cok paylasilan gorevler: Raporlama (4 departman), Dokumantasyon (4 departman) ve Performans degerlendirme (3 departman) seklindedir.",
  tekrar: "En cok tekrar eden gorevler:\n\n1. **Raporlama** - 4 departmanda (Muhasebe, Veri Analitigi, Butce Planlama, Dijital Pazarlama)\n2. **Dokumantasyon** - 4 departmanda\n3. **Performans Degerlendirme** - 3 departmanda\n\nBu gorevler standardize edilebilir ve otomasyon potansiyeli yuksektir.",
  rpa: "RPA (Robotik Surec Otomasyonu) icin en uygun isler:\n\n1. **Envanter Kontrolu** - %90 otomasyon orani\n2. **Raporlama** - %85 otomasyon orani\n3. **Sistem Bakimi** - %80 otomasyon orani\n4. **Dokumantasyon** - %75 otomasyon orani\n\nBu gorevler tekrarli ve kural tabanli oldugu icin RPA ile kolayca otomatize edilebilir.",
  potansiyel: "Otomasyon potansiyeli en yuksek direktorlukler:\n\n1. **Finans Direktorlugu** - Bordro, muhasebe ve raporlama surecleri\n2. **Operasyon Direktorlugu** - Envanter ve uretim takibi\n3. **BT Direktorlugu** - Sistem bakimi ve izleme\n\nBu alanlarda %70-90 arasi otomasyon saglanbilir.",
  yogun: "En yogun mudurlukler:\n\n1. **Yazilim Gelistirme** - 67 gorev\n2. **Uretim** - 62 gorev\n3. **Sistem Yonetimi** - 52 gorev\n4. **Muhasebe** - 48 gorev\n\nYazilim Gelistirme mudurluğu en fazla gorev yukune sahiptir.",
  ai: "AI ile cozulebilecek gorevler:\n\n1. **Veri Analizi** - %80 otomasyon potansiyeli\n2. **Risk Degerlendirme** - %75 otomasyon potansiyeli\n3. **Guvenlik Izleme** - %85 otomasyon potansiyeli\n4. **Icerik Uretimi** - %40 otomasyon potansiyeli\n\nBu gorevler karmasik karar verme ve desen tanima gerektirdigi icin AI cozumleri uygundur.",
}
