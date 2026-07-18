import "@fortawesome/fontawesome-free/css/all.min.css";

const app = window.angular.module("portfolioApp", []);

app.controller("PortfolioController", function PortfolioController($document, $http, $scope) {
  const vm = this;

  this.currentYear = new Date().getFullYear();
  this.selectedProject = null;
  this.selectedBlog = null;
  this.activeSlide = 0;
  this.pageSize = 8;
  this.projectPage = 1;
  this.blogPage = 1;
  this.contentStatus = "Loading content…";

  this.padNumber = function padNumber(value) {
    return String(value).padStart(2, "0");
  };

  function parseWorkDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})/);
    return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
  }

  function formatWorkDate(value) {
    const date = parseWorkDate(value);
    if (!date) return "";
    return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" })
      .format(new Date(date.year, date.month - 1, 1));
  }

  this.workDateRange = function workDateRange(experience) {
    const start = formatWorkDate(experience.startDate);
    const end = experience.endDate ? formatWorkDate(experience.endDate) : "Current";
    if (!start) return end || experience.period || "Add dates";
    return `${start} — ${end || "Current"}`;
  };

  this.workDuration = function workDuration(experience) {
    const start = parseWorkDate(experience.startDate);
    if (!start) return "";
    const now = new Date();
    const end = parseWorkDate(experience.endDate) || { year: now.getFullYear(), month: now.getMonth() + 1 };
    const totalMonths = Math.max(0, (end.year - start.year) * 12 + (end.month - start.month));
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const parts = [];
    if (years) parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
    if (months || !years) parts.push(`${months} ${months === 1 ? "mo" : "mos"}`);
    return parts.join(" ");
  };

  this.blogPostedAgo = function blogPostedAgo(blog) {
    const value = blog.publishedAt || blog.date;
    const published = new Date(value);
    if (!value || Number.isNaN(published.getTime())) return "Add publish date";
    const seconds = Math.max(0, Math.floor((Date.now() - published.getTime()) / 1000));
    if (seconds < 60) return "Posted just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Posted ${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Posted ${hours} ${hours === 1 ? "hr" : "hrs"} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Posted ${days} ${days === 1 ? "day" : "days"} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `Posted ${months} ${months === 1 ? "month" : "months"} ago`;
    const years = Math.floor(months / 12);
    return `Posted ${years} ${years === 1 ? "year" : "years"} ago`;
  };

  this.profile = {
    name: "Pyanz Jheo Quiros",
    role: "Software Developer",
    availability: "Available for select projects",
    intro:
      "I build reliable business applications and clean digital experiences, turning complex requirements into software that feels simple to use.",
    details: [
      { label: "Based in", value: "Cebu City, Philippines" },
      { label: "Focus", value: "Web & business systems" },
      { label: "Experience", value: "Full-stack development" },
    ],
  };

  this.socialLinks = [
    {
      name: "LinkedIn",
      icon: "fa-brands fa-linkedin-in",
      url: "https://www.linkedin.com/in/your-profile",
      external: true,
    },
    {
      name: "Instagram",
      icon: "fa-brands fa-instagram",
      url: "https://www.instagram.com/your-username",
      external: true,
    },
    {
      name: "Facebook",
      icon: "fa-brands fa-facebook-f",
      url: "https://www.facebook.com/your-profile",
      external: true,
    },
    {
      name: "Email",
      icon: "fa-solid fa-envelope",
      url: "mailto:your-email@example.com",
      external: false,
    },
  ];

  this.projects = [];
  this.blogs = [];

  this.getProjectPage = function getProjectPage() {
    const start = (vm.projectPage - 1) * vm.pageSize;
    return vm.projects.slice(start, start + vm.pageSize);
  };

  this.getBlogPage = function getBlogPage() {
    const start = (vm.blogPage - 1) * vm.pageSize;
    return vm.blogs.slice(start, start + vm.pageSize);
  };

  this.pageCount = function pageCount(items) {
    return Math.max(1, Math.ceil(items.length / vm.pageSize));
  };

  this.setPage = function setPage(type, page) {
    const items = type === "projects" ? vm.projects : vm.blogs;
    const safePage = Math.min(Math.max(1, page), vm.pageCount(items));
    if (type === "projects") vm.projectPage = safePage;
    if (type === "blogs") vm.blogPage = safePage;
  };

  function loadContent() {
    $http.get("./content/portfolio.json").then(
      function contentLoaded(response) {
        vm.projects = response.data.projects;
        vm.blogs = response.data.blogs;
        vm.profile = response.data.profile;
        vm.socialLinks = response.data.socialLinks;
        vm.educationHistory = response.data.educationHistory;
        vm.workExperiences = response.data.workExperiences;
        vm.skills = response.data.skills;
        vm.contentStatus = "";
      },
      function contentFailed() {
        vm.contentStatus = "Using the bundled offline content.";
      },
    );
  }

  loadContent();

  this.openBlog = function openBlog(blog) {
    vm.selectedBlog = blog;
  };

  this.closeBlog = function closeBlog() {
    vm.selectedBlog = null;
  };

  this.openProject = function openProject(project) {
    vm.selectedProject = project;
    vm.activeSlide = 0;
  };

  this.closeProject = function closeProject() {
    vm.selectedProject = null;
    vm.activeSlide = 0;
  };

  this.goToSlide = function goToSlide(index) {
    vm.activeSlide = index;
  };

  this.previousSlide = function previousSlide() {
    const count = vm.selectedProject.images.length;
    vm.activeSlide = (vm.activeSlide - 1 + count) % count;
  };

  this.nextSlide = function nextSlide() {
    const count = vm.selectedProject.images.length;
    vm.activeSlide = (vm.activeSlide + 1) % count;
  };

  function handleEscape(event) {
    if (event.key === "Escape" && vm.selectedProject) {
      $scope.$applyAsync(vm.closeProject);
    }

    if (event.key === "Escape" && vm.selectedBlog) {
      $scope.$applyAsync(vm.closeBlog);
    }

    if (event.key === "ArrowLeft" && vm.selectedProject) {
      $scope.$applyAsync(vm.previousSlide);
    }

    if (event.key === "ArrowRight" && vm.selectedProject) {
      $scope.$applyAsync(vm.nextSlide);
    }
  }

  $document.on("keydown", handleEscape);
  $scope.$on("$destroy", function removeKeyHandler() {
    $document.off("keydown", handleEscape);
  });

  this.educationHistory = [
    {
      course: "Bachelor’s Degree in Information Technology",
      school: "Add college or university",
      location: "Cebu, Philippines",
      period: "Add year",
      description:
        "Academic foundation in programming, databases, systems analysis, and software development.",
    },
    {
      course: "Secondary Education",
      school: "Add school name",
      location: "Cebu, Philippines",
      period: "Add year",
      description: "Add your academic strand, awards, or other relevant details.",
    },
  ];

  this.workExperiences = [
    {
      role: "Software Developer",
      company: "Jinisys Software Inc.",
      startDate: "",
      endDate: "",
      description:
        "Developing hospitality and business systems using C#, AngularJS, SQL Server, APIs, and responsive interface design.",
    },
    {
      role: "Add job title",
      company: "Add company name",
      startDate: "",
      endDate: "",
      description: "Add your main responsibilities and achievements for this role.",
    },
    {
      role: "Add job title",
      company: "Add company name",
      startDate: "",
      endDate: "",
      description: "Add your main responsibilities and achievements for this role.",
    },
  ];

  this.skills = [
    { name: "C# / .NET", icon: "fa-solid fa-code" },
    { name: "AngularJS", icon: "fa-brands fa-angular" },
    { name: "SQL Server", icon: "fa-solid fa-database" },
    { name: "REST APIs", icon: "fa-solid fa-plug" },
    { name: "JavaScript", icon: "fa-brands fa-js" },
    { name: "UI Design", icon: "fa-solid fa-layer-group" },
  ];
});
