import "@fortawesome/fontawesome-free/css/all.min.css";

const app = window.angular.module("contentEditorApp", []);

app.controller("ContentEditorController", ["$http", "$scope", "$window", function ContentEditorController($http, $scope, $window) {
  const vm = this;

  this.section = "projects";
  this.projects = [];
  this.blogs = [];
  this.site = { profile: {}, socialLinks: [], educationHistory: [], workExperiences: [], skills: [] };
  this.form = null;
  this.editIndex = -1;
  this.status = "Loading JSON content…";
  this.jsonPreview = "";
  this.copyLabel = "Copy JSON";

  this.sections = [
    { key: "projects", label: "Projects", singular: "Project", icon: "fa-solid fa-diagram-project" },
    { key: "blogs", label: "Blogs", singular: "Blog", icon: "fa-solid fa-newspaper" },
    { key: "work", label: "Work experience", singular: "Work experience", icon: "fa-solid fa-briefcase" },
    { key: "education", label: "Education", singular: "Education", icon: "fa-solid fa-graduation-cap" },
    { key: "skills", label: "Skills", singular: "Skill", icon: "fa-solid fa-code" },
    { key: "socials", label: "Social links", singular: "Social link", icon: "fa-solid fa-link" },
    { key: "profile", label: "Profile", singular: "Profile", icon: "fa-solid fa-user" },
  ];

  const fields = {
    projects: [
      { key: "name", label: "Project name", required: true },
      { key: "year", label: "Year" },
      { key: "category", label: "Category" },
      { key: "image", label: "Main image path", help: "Example: ./assets/project-image.webp" },
      { key: "imageAlt", label: "Image description" },
      { key: "imagesText", label: "Gallery image paths", type: "textarea", rows: 4, wide: true, help: "One image path per line." },
      { key: "shortDescription", label: "Short card description", type: "textarea", rows: 2, wide: true, required: true },
      { key: "description", label: "Full project description", type: "textarea", rows: 5, wide: true, required: true },
      { key: "previewTitle", label: "Hover preview title" },
      { key: "techText", label: "Technologies", help: "Separate with commas." },
      { key: "preview", label: "Hover preview details", type: "textarea", wide: true },
      { key: "challenge", label: "Challenge", type: "textarea", wide: true },
      { key: "solution", label: "Solution", type: "textarea", wide: true },
    ],
    blogs: [
      { key: "title", label: "Blog title", required: true, wide: true },
      { key: "publishedAt", label: "Published date and time", type: "datetime-local", required: true, help: "Used to display Posted 5 mins ago, Posted 2 days ago, and similar labels." },
      { key: "excerpt", label: "Summary", type: "textarea", rows: 3, wide: true, required: true },
      { key: "paragraphsText", label: "Article paragraphs", type: "textarea", rows: 10, wide: true, required: true, help: "Separate paragraphs with a blank line." },
      { key: "tagsText", label: "Tags", wide: true, help: "Separate with commas." },
    ],
    work: [
      { key: "role", label: "Job title", required: true },
      { key: "company", label: "Company", required: true },
      { key: "startDate", label: "Start date", type: "month", help: "Select the month and year you started." },
      { key: "endDate", label: "End date", type: "month", help: "Leave empty to display Current." },
      { key: "description", label: "Responsibilities and achievements", type: "textarea", rows: 5, wide: true },
    ],
    education: [
      { key: "course", label: "Course or qualification", required: true },
      { key: "school", label: "School", required: true },
      { key: "location", label: "Location" },
      { key: "period", label: "Year or period" },
      { key: "description", label: "Academic details", type: "textarea", rows: 4, wide: true },
    ],
    skills: [
      { key: "name", label: "Skill name", required: true },
      { key: "icon", label: "Font Awesome class", help: "Example: fa-solid fa-code" },
    ],
    socials: [
      { key: "name", label: "Platform name", required: true },
      { key: "url", label: "URL or mailto link", required: true },
      { key: "icon", label: "Font Awesome class" },
      { key: "externalText", label: "Open in new tab", help: "Enter true or false." },
    ],
    profile: [
      { key: "name", label: "Full name", required: true },
      { key: "role", label: "Professional role", required: true },
      { key: "availability", label: "Availability message", wide: true },
      { key: "intro", label: "Introduction", type: "textarea", rows: 5, wide: true },
      { key: "detailsText", label: "Quick details", type: "textarea", rows: 5, wide: true, help: "One per line in Label: Value format." },
    ],
  };

  $http.get("./content/portfolio.json").then(function loaded(response) {
    vm.projects = response.data.projects;
    vm.blogs = response.data.blogs;
    vm.site = {
      profile: response.data.profile,
      socialLinks: response.data.socialLinks,
      educationHistory: response.data.educationHistory,
      workExperiences: response.data.workExperiences,
      skills: response.data.skills,
    };
    vm.status = "Content loaded. Changes stay in this browser until you save a JSON file.";
  }, function failed() {
    vm.status = "Could not load the JSON files. Run this editor through npm run dev.";
  });

  this.currentSection = () => vm.sections.find((section) => section.key === vm.section);
  this.currentFields = () => fields[vm.section] || [];
  this.pad = (value) => String(value).padStart(2, "0");

  this.items = function items(sectionKey = vm.section) {
    const map = {
      projects: vm.projects,
      blogs: vm.blogs,
      work: vm.site.workExperiences,
      education: vm.site.educationHistory,
      skills: vm.site.skills,
      socials: vm.site.socialLinks,
      profile: [vm.site.profile],
    };
    return map[sectionKey] || [];
  };

  this.itemTitle = function itemTitle(item) {
    return item.name || item.title || item.role || item.course || item.company || "Untitled entry";
  };

  this.itemDescription = function itemDescription(item) {
    return item.shortDescription || item.excerpt || item.company || item.school || item.url || item.description || item.icon || "No description yet.";
  };

  function slugify(value) {
    return String(value || "item").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function flatten(item) {
    const copy = window.angular.copy(item);
    if (vm.section === "projects") {
      copy.imagesText = (copy.images || []).map((image) => image.src).join("\n");
      copy.techText = (copy.tech || []).join(", ");
    }
    if (vm.section === "blogs") {
      if (!copy.publishedAt && copy.date && !Number.isNaN(new Date(copy.date).getTime())) {
        const legacyDate = new Date(copy.date);
        copy.publishedAt = new Date(legacyDate.getTime() - legacyDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      }
      copy.paragraphsText = (copy.paragraphs || []).join("\n\n");
      copy.tagsText = (copy.tags || []).join(", ");
    }
    if (vm.section === "socials") copy.externalText = String(copy.external !== false);
    if (vm.section === "profile") copy.detailsText = (copy.details || []).map((detail) => `${detail.label}: ${detail.value}`).join("\n");
    if (vm.section === "work") {
      copy.startDate = monthModel(copy.startDate);
      copy.endDate = monthModel(copy.endDate);
    }
    return copy;
  }

  function monthModel(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})/);
    return match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)) : null;
  }

  function monthString(value) {
    if (!value) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
    }
    const match = String(value).match(/^(\d{4})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}` : "";
  }

  this.startAdd = function startAdd(sectionKey) {
    vm.section = sectionKey;
    vm.editIndex = -1;
    const defaults = {
      projects: { year: String(new Date().getFullYear()), image: "./assets/project-image.webp", category: "Web application", imagesText: "./assets/project-image.webp", techText: "AngularJS" },
      blogs: { publishedAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16), tagsText: "Development", paragraphsText: "" },
      work: { startDate: null, endDate: null }, education: { location: "Cebu, Philippines" },
      skills: { icon: "fa-solid fa-code" }, socials: { externalText: "true", icon: "fa-solid fa-link" },
    };
    vm.form = window.angular.copy(defaults[vm.section] || {});
  };

  this.startEdit = function startEdit(sectionKey, index) {
    vm.section = sectionKey;
    vm.editIndex = index;
    vm.form = flatten(vm.items()[index]);
  };

  this.closeForm = function closeForm() {
    vm.form = null;
    vm.editIndex = -1;
  };

  function serialize(form) {
    const item = window.angular.copy(form);
    if (vm.section === "projects") {
      item.id = item.id || slugify(item.name);
      item.tech = String(item.techText || "").split(",").map((value) => value.trim()).filter(Boolean);
      item.images = String(item.imagesText || item.image || "").split("\n").map((value) => value.trim()).filter(Boolean).map((src) => ({ src, alt: item.imageAlt || item.name }));
      item.image = item.image || item.images[0]?.src || "";
      delete item.techText; delete item.imagesText;
    }
    if (vm.section === "blogs") {
      item.id = item.id || slugify(item.title);
      item.tags = String(item.tagsText || "").split(",").map((value) => value.trim()).filter(Boolean);
      item.paragraphs = String(item.paragraphsText || "").split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
      delete item.tagsText; delete item.paragraphsText; delete item.date; delete item.readTime;
    }
    if (vm.section === "socials") { item.external = String(item.externalText).toLowerCase() !== "false"; delete item.externalText; }
    if (vm.section === "work") {
      item.startDate = monthString(item.startDate);
      item.endDate = monthString(item.endDate);
      delete item.period;
    }
    if (vm.section === "profile") {
      item.details = String(item.detailsText || "").split("\n").map((line) => { const split = line.indexOf(":"); return split < 0 ? null : { label: line.slice(0, split).trim(), value: line.slice(split + 1).trim() }; }).filter(Boolean);
      delete item.detailsText;
    }
    return item;
  }

  this.saveEntry = function saveEntry() {
    const item = serialize(vm.form);
    if (vm.section === "profile") vm.site.profile = item;
    else if (vm.editIndex === -1) vm.items().push(item);
    else vm.items()[vm.editIndex] = item;
    vm.closeForm();
    vm.status = "Entry updated in memory. Click Show portfolio.json when you are finished.";
  };

  this.remove = function remove(sectionKey, index) {
    vm.section = sectionKey;
    const item = vm.items(sectionKey)[index];
    if (!$window.confirm(`Delete “${vm.itemTitle(item)}” from this JSON?`)) return;
    vm.items(sectionKey).splice(index, 1);
    vm.status = "Entry deleted in memory. Click Show portfolio.json to copy the complete update.";
  };

  this.outputFilename = () => "portfolio.json";
  this.outputData = () => ({ projects: vm.projects, blogs: vm.blogs, ...vm.site });

  this.copyJson = async function copyJson() {
    await navigator.clipboard.writeText(`${JSON.stringify(vm.outputData(), null, 2)}\n`);
    $scope.$applyAsync(function copied() {
      vm.status = `${vm.outputFilename()} copied to the clipboard.`;
    });
  };

  this.showJson = function showJson() {
    vm.jsonPreview = `${JSON.stringify(vm.outputData(), null, 2)}\n`;
    vm.copyLabel = "Copy JSON";
  };

  this.closeJson = function closeJson() {
    vm.jsonPreview = "";
    vm.copyLabel = "Copy JSON";
  };

  this.copyPreview = async function copyPreview() {
    await navigator.clipboard.writeText(vm.jsonPreview);
    $scope.$applyAsync(function copiedPreview() {
      vm.copyLabel = "Copied!";
      vm.status = `${vm.outputFilename()} copied. Paste it into public/content/portfolio.json.`;
    });
  };
}]);
