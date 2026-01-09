
class carousel

{

    constructor(size)

    {

        this.size = size;
        this.position = 0

    }

    spinFwd()

    {this.position =  (this.position +1)%this.size;}

    spinBwd()

    {this.position = (this.position -1 + this.size)%this.size;}

    pos()

    {return this.position}

    next()

    {return (this.position +1)%this.size;}

    prev()

    {return (this.position -1 + this.size)%this.size;}

}



class experience

{

    constructor(name)

    {this.organization = name
    this.description = null;
    this.skills = null;
    this.logoUrl = null;
    this.link = null;
    this.dateText = null;}

    goToOrganization()

    {

        window.open(this.link, "_blank");

    }



    pushToScreen()

    {

        this.experienceBox = document.createElement("div");
        this.experienceBox.className = "experienceBox";
        experienceArea.appendChild(this.experienceBox);

        this.title = document.createElement("h1");
        this.title.className = "projectTitle";
        this.title.textContent = this.organization;
        this.title.addEventListener("click", () => this.goToOrganization());
        this.experienceBox.appendChild(this.title);

        this.logo = document.createElement("img");
        this.logo.className = "experienceLogo";
        this.logo.src = `images/${this.logoUrl}`;
        this.logo.addEventListener("click", () => this.goToOrganization());
        this.experienceBox.appendChild(this.logo);

        this.date = document.createElement("h1");
        this.date.className = "experienceDate"; 
        this.date.textContent = this.dateText;
        this.experienceBox.appendChild(this.date);

        this.textBody = document.createElement("div");
        this.textBody.innerHTML = this.description; 
        this.textBody.className = "projectDescription";
        this.textBody.style.fontSize = "10px";
        this.experienceBox.appendChild(this.textBody);


    }

}

class quickLink

{

    static counter = 0;

    constructor (name)

    {this.name = name;
    quickLink.counter++;
    this.id = quickLink.counter;
    this.imageScale = 1;
    this.clickFuncton = null;
    this.activeUrl = null;
    this.inactiveUrl = null;}


    imageScale(imageScale)

    {this.imageScale = imageScale}

    pushToScreen()

    {
        

        this.linkText = document.createElement("h1");
        this.linkText.textContent = this.name;
        this.linkText.className = "linkText";
        this.linkText.classList.add("linkTextHidden");
        this.linkText.style.gridArea = `link-${this.id}-text`;
        this.linkText.addEventListener("mouseover", () => this.activate());
        this.linkText.addEventListener("mouseleave", () => this.deactivate());
        this.linkText.addEventListener("click", () => this.clickFunction());
        linkArea.appendChild(this.linkText);

        this.icon = document.createElement("img");
        this.icon.className = "linkImage";
        this.icon.src = `images/${this.inactiveUrl}`;
        this.icon.style.gridArea = `link-${this.id}-pic`;
        this.icon.addEventListener("mouseover", () => this.activate());
        this.icon.addEventListener("mouseleave", () => this.deactivate());
        this.icon.addEventListener("click", () => this.clickFunction());
        linkArea.appendChild(this.icon);

    }

    activate()

    {

        this.icon.classList.add("linkImageOpen");
        this.linkText.classList.remove("linkTextHidden");
        this.icon.src = `images/${this.activeUrl}`;


    }

    deactivate()

    {

        this.icon.classList.remove("linkImageOpen");
        this.linkText.classList.add("linkTextHidden");
        this.icon.src = `images/${this.inactiveUrl}`;

    }

}

class project
        
{

    constructor(name)

    {

    this.name = name;
    this.cover = 0;
    this.images = [];
    this.mediaTypes = [];
    this.models = [];
    this.frontImage = 0;
    this.imageCarousel = new carousel(1);
    this.skills = []; 
    this.captions = [];
    this.mediaTitles = [];
    this.startX = 0;
    this.startY = 0;

    }

    addDescription(blurb,description)

    {

        this.blurb = blurb;
        this.description = description;
    }

    addImage(imageName)

    {

        this.images.push(imageName);
        this.mediaTypes.push("image");
        this.imageCarousel = new carousel(this.images.length);


    }

    addModel(modelName)

    {

        this.images.push(modelName);
        this.mediaTypes.push("model")
        this.imageCarousel = new carousel(this.images.length);

    }

    addVideo(videoName)

    {

        this.images.push(videoName);
        this.mediaTypes.push("video")
        this.imageCarousel = new carousel(this.images.length);

    }

    pushToScreen()

    {

        this.projectBox = document.createElement("div");
        this.projectBox.className = "project";
        this.projectBox.classList.add("projectInactive");
        this.projectBox.id = this.name; 
        this.projectBox.addEventListener("mouseenter", () => this.activate());
        this.projectBox.addEventListener("mouseleave", () => this.deactivate());

        this.coverImage = document.createElement("img");
        this.coverImage.className = "coverImage";
        this.coverImage.src = this.cover; 
        this.coverImage.classList.add("coverImageClosed");
        this.projectBox.appendChild(this.coverImage)



        this.projectTitle = document.createElement("h1");
        this.projectTitle.className = "projectTitle"
        this.projectTitle.textContent = this.name; 
        this.projectBox.appendChild(this.projectTitle);

        this.projectDescription = document.createElement("p");
        this.projectDescription.className = "projectDescription";
        this.projectDescription.textContent = this.blurb;
        this.projectBox.appendChild(this.projectDescription);

        // this.skillsContainer = document.createElement("div");
        // this.skillsContainer.className = "skillsContainer";
        // this.projectBox.appendChild(this.skillsContainer)

        // for(let i = 0; i < this.skills.length; i++)

        // {

        // this.skill = document.createElement("h1");
        // this.skill.className = "projectSkill";
        // //this.skill.classList.add("");
        // this.skill.id = `${this.name}-skill${i}`;
        // this.skill.textContent = this.skills[i];
        // this.skillsContainer.appendChild(this.skill);

        // }

        this.imageArea = document.createElement("div");
        this.imageArea.className = "pictureArea";
        this.projectBox.appendChild(this.imageArea);

        this.imageElements = [];
        for(let i = 0; i < (this.images).length; i++)

        {

            if(this.mediaTypes[i] === "image")

            {

            this.imageElements[i] = document.createElement("img");
            this.imageElements[i].className = "picture";
            this.imageElements[i].classList.add("pictureClosed");
            this.imageElements[i].id = `${this.name}-image${i}`;
            this.imageElements[i].src = `images/${this.images[i]}`;
            this.imageElements[i].addEventListener("click", (event) => {

                const rect = event.currentTarget.getBoundingClientRect();
                const mousePos = event.clientX - rect.left;
                const middle = rect.width / 2;
              
                if (mousePos < middle) {
                  this.rotateImage(false);
                } else {
                  this.rotateImage(true);
                }
            
              });    

            }

            else if(this.mediaTypes[i] === "model")

            {

                this.imageElements[i] = document.createElement("model-viewer");
                this.imageElements[i].id = `${this.name}-image${i}`;
                this.imageElements[i].src = `images/${this.images[i]}`;
                this.imageElements[i].className = "model";
                this.imageElements[i].setAttribute("camera-controls", "");
                this.imageElements[i].setAttribute("auto-rotate", true);
                this.imageElements[i].setAttribute("rotation-per-second", "90deg");
                this.imageElements[i].setAttribute("environment-image", "neutral");
                this.imageElements[i].setAttribute("shadow-intensity", "0.5");
                this.imageElements[i].setAttribute("camera-orbit", "0deg 75deg 0.5m");
                this.imageElements[i].setAttribute("camera-target", "0m 0.02m 0m");
                this.imageElements[i].setAttribute("field-of-view", "30deg");
                this.imageElements[i].setAttribute("scale", "1 1 1");

                    
                this.imageElements[i].addEventListener("mousedown", (event) => {
                    this.startX = event.clientX;
                    this.startY = event.clientY;
                });

                
                this.imageElements[i].addEventListener("mouseup", (event) => {
                    const dx = event.clientX - this.startX;
                    const dy = event.clientY - this.startY;
                
                    const distance = Math.sqrt(dx * dx + dy * dy);
                
                    if (distance > 6) return;
                
                    const rect = event.currentTarget.getBoundingClientRect();
                    const mousePos = event.clientX - rect.left;
                    const middle = rect.width / 2;
                
                    if (mousePos < middle) {
                        this.rotateImage(false);
                    } else {
                        this.rotateImage(true);
                    }
                });

            }

            else if(this.mediaTypes[i] === "video")

            {

                this.imageElements[i] = document.createElement("video");
                this.imageElements[i].className = "video";
                this.imageElements[i].classList.add("pictureClosed");
                this.imageElements[i].id = `${this.name}-image${i}`;
                this.imageElements[i].src = `images/${this.images[i]}`;
                this.imageElements[i].autoplay = true;   
                this.imageElements[i].loop = true;       
                this.imageElements[i].playsInline = true;
                this.imageElements[i].controls = false;             
                this.imageElements[i].autoplay = false;          
                this.imageElements[i].loop = true;                 
                this.imageElements[i].muted = true; 
                this.imageElements[i].addEventListener("click", (event) => {

                    const rect = event.currentTarget.getBoundingClientRect();
                    const mousePos = event.clientX - rect.left;
                    const middle = rect.width / 2;
                  
                    if (mousePos < middle) {
                      this.rotateImage(false);
                    } else {
                      this.rotateImage(true);
                    }
                
                  });

            }

            if(i === 0)

            {this.imageElements[i].style.zIndex = 1}

            else

            {this.imageElements[i].style.zIndex = 0;}

            this.imageArea.appendChild(this.imageElements[i]);

        }

        this.caption = document.createElement("h1");
        this.caption.className = "pictureCaption";
        this.projectBox.appendChild(this.caption);

        this.mediaTitle = document.createElement("h1");
        this.mediaTitle.className = "mediaTitle";
        this.projectBox.appendChild(this.mediaTitle);

        projectList.appendChild(this.projectBox);


    }

    activate()

    {

        this.projectBox.classList.remove("projectInactive");
        this.projectBox.classList.add("projectActive");
        this.projectDescription.textContent = this.description;
        this.caption.textContent = this.captions[this.imageCarousel.pos()];
        this.coverImage.classList.remove("coverImageClosed");

        
        for(let i = 0; i < this.images.length; i++)

        {

            this.imageElements[i].classList.remove("pictureClosed");


        }

        // for(let i = 0; i < this.skills.length; i++)

        // {

        // const skill = document.getElementById(`${this.name}-skill${i}`);
        // skill.classList.remove("hiddenSkill");

        // }

        this.caption.textContent = this.captions[this.imageCarousel.pos()];
        this.mediaTitle.textContent = this.mediaTitles[this.imageCarousel.pos()];


        const newImage = document.getElementById(`${this.name}-image${this.imageCarousel.pos()}`);
        newImage.classList.add("pictureFront");
        newImage.style.zIndex = 1;
        newImage.style.opacity = 1;
        const newLeft = document.getElementById(`${this.name}-image${this.imageCarousel.next()}`);
        newLeft.classList.add("pictureAfter");
        newLeft.style.opacity = 0.5;
        const newRight = document.getElementById(`${this.name}-image${this.imageCarousel.prev()}`);
        newRight.classList.add("pictureBefore");
        newRight.style.opacity = 0.5;

    }

    deactivate()

    {


        this.projectDescription.textContent = this.blurb;
        this.caption.textContent = "";
        this.mediaTitle.textContent = "";
        this.coverImage.classList.add("coverImageClosed");



        for(let i = 0; i < (this.images).length; i++)

        {

            this.imageElements[i].classList.remove("pictureFront");
            this.imageElements[i].classList.remove("pictureBefore");
            this.imageElements[i].classList.remove("pictureAfter");
            this.imageElements[i].classList.add("pictureClosed");

        }

        this.projectBox.classList.remove("projectActive");
        this.projectBox.classList.add("projectInactive");
        this.projectBox.classList.add("projectDeactivateBuffer");



        setTimeout(() => {

            this.projectBox.classList.remove("projectDeactivateBuffer");

        }, 1000);



    }

    rotateImage(direction)

    {        

        const oldImage = document.getElementById(`${this.name}-image${this.imageCarousel.pos()}`);
        oldImage.classList.remove("pictureFront");
        oldImage.style.zIndex = 0;
        const oldLeft = document.getElementById(`${this.name}-image${this.imageCarousel.next()}`);
        oldLeft.classList.remove("pictureAfter");
        oldLeft.style.opacity = 0;
        const oldRight = document.getElementById(`${this.name}-image${this.imageCarousel.prev()}`);
        oldRight.classList.remove("pictureBefore");
        oldRight.style.opacity = 0;

        if(direction)
        {
        this.imageCarousel.spinFwd();
        }
        else
        {
        this.imageCarousel.spinBwd();
        }


        this.caption.textContent = this.captions[this.imageCarousel.pos()];
        this.mediaTitle.textContent = this.mediaTitles[this.imageCarousel.pos()];


        const newImage = document.getElementById(`${this.name}-image${this.imageCarousel.pos()}`);
        newImage.classList.add("pictureFront");
        newImage.style.zIndex = 1;
        newImage.style.opacity = 1;
        const newLeft = document.getElementById(`${this.name}-image${this.imageCarousel.next()}`);
        newLeft.classList.add("pictureAfter");
        newLeft.style.opacity = 0.5;
        const newRight = document.getElementById(`${this.name}-image${this.imageCarousel.prev()}`);
        newRight.classList.add("pictureBefore");
        newRight.style.opacity = 0.5;

        if(this.mediaTypes[this.imageCarousel.pos()] === "video")

        {
            newImage.currentTime = 0;
            newImage.play();
        }

        if(this.mediaTypes[this.imageCarousel.next()] === "video")

        {
            newLeft.pause();
        }

        if(this.mediaTypes[this.imageCarousel.prev()] === "video")

        {
            newRight.pause();
        }

        if(this.mediaTypes[this.imageCarousel.pos()] === "model")

        {
            newImage.style.width = "60%";
        }

    }

}

let isDay = false;

function goToPage(newPage) 

{window.location.href = newPage;}


function changeDayNight() {
    console.log("pressed");

    if(isDay) {

        document.documentElement.style.setProperty("--background-colour", "var(--background-colour-night)");
        document.documentElement.style.setProperty("--name-colour", "var(--name-colour-night)");
        document.documentElement.style.setProperty("--text1-colour", "var(--text1-colour-night)");
        document.documentElement.style.setProperty("--text2-colour", "var(--text2-colour-night)");
    
        document.documentElement.style.setProperty("--accent-colour-active", "var(--accent-colour-active-night)");
        document.documentElement.style.setProperty("--accent-colour-inactive", "var(--accent-colour-inactive-night)");
    
        document.documentElement.style.setProperty("--secondary-colour-active", "var(--secondary-colour-active-night)");
        document.documentElement.style.setProperty("--secondary-colour-inactive", "var(--secondary-colour-inactive-night)");
    
        document.documentElement.style.setProperty("--fill-colour-active", "var(--fill-colour-active-night)");
        document.documentElement.style.setProperty("--fill-colour-inactive", "var(--fill-colour-inactive-night)");
    
        document.documentElement.style.setProperty("--highlight-colour", "var(--highlight-colour-night)");
    
        isDay = false;

    } else {

        document.documentElement.style.setProperty("--background-colour", "var(--background-colour-day)");
        document.documentElement.style.setProperty("--name-colour", "var(--name-colour-day)");
        document.documentElement.style.setProperty("--text1-colour", "var(--text1-colour-day)");
        document.documentElement.style.setProperty("--text2-colour", "var(--text2-colour-day)");
    
        document.documentElement.style.setProperty("--accent-colour-active", "var(--accent-colour-active-day)");
        document.documentElement.style.setProperty("--accent-colour-inactive", "var(--accent-colour-inactive-day)");
    
        document.documentElement.style.setProperty("--secondary-colour-active", "var(--secondary-colour-active-day)");
        document.documentElement.style.setProperty("--secondary-colour-inactive", "var(--secondary-colour-inactive-day)");
    
        document.documentElement.style.setProperty("--fill-colour-active", "var(--fill-colour-active-day)");
        document.documentElement.style.setProperty("--fill-colour-inactive", "var(--fill-colour-inactive-day)");
    
        document.documentElement.style.setProperty("--highlight-colour", "var(--highlight-colour-day)");
    
        isDay = true;
    }
    
}


//import {carousel, experience, project, quickLink} from "./classes.js";


const mainGrid = document.createElement("div");
mainGrid.className = "projectContainer";
document.body.appendChild(mainGrid);

const mainBio = document.createElement("hi")
mainBio.className = "bio";
mainBio.textContent = "Motivated Mechatronics Engineering Student at the University of Waterloo experienced in robotics, 3D modeling, and computer programming (java, python, C, C++, javascript)";
mainGrid.appendChild(mainBio);

const projectList = document.createElement("div");
projectList.className = "projectList";
mainGrid.appendChild(projectList);

const nameTitle = document.createElement("h1");
nameTitle.className = "nameTitle";
nameTitle.textContent = "JAMES SMITH";
nameTitle.addEventListener("click",changeDayNight);
mainGrid.appendChild(nameTitle);

const searcherArea = document.createElement("div");
searcherArea.className = "searcherArea";
mainGrid.appendChild(searcherArea);

function find(target)

{target.scrollIntoView({ behavior: "smooth",block: "start"});}

const projectsSearcher = document.createElement("h1");
projectsSearcher.className = "searcher";
projectsSearcher.textContent = " projects ";
projectsSearcher.addEventListener("click", () =>  find(projectsHeading))
searcherArea.appendChild(projectsSearcher);

const experienceSearcher = document.createElement("h1");
experienceSearcher.className = "searcher";
experienceSearcher.textContent = " experience ";
experienceSearcher.addEventListener("click", () =>  find(experienceHeading))
searcherArea.appendChild(experienceSearcher);

const educationSearcher = document.createElement("h1");
educationSearcher.className = "searcher";
educationSearcher.textContent = " education ";
educationSearcher.addEventListener("click", () =>  find(educationHeading))
searcherArea.appendChild(educationSearcher);

const linkArea = document.createElement("div");
linkArea.className = "linkArea";
mainGrid.appendChild(linkArea);

let links = [];

links.push(new quickLink("jamestsmith07@icloud.com"));
links[0].activeUrl = "email-outline-active.svg";
links[0].inactiveUrl = "email-outline-inactive.svg";
function emailMe()
{window.location.href = "mailto:jamestsmith@icloud.com";};
links[0].clickFunction = emailMe;

links.push(new quickLink("linkedin.james"));
function linkedinConnect()
{window.open("https://ca.linkedin.com/in/james-smith-07314926b", "_blank");}
links[1].clickFunction = linkedinConnect;
links[1].activeUrl = "linkedin-big-logo-active.svg";
links[1].inactiveUrl = "linkedin-big-logo-inactive.svg";

const projectsHeading = document.createElement("h1");
projectsHeading.className = "sectionHeading";
projectsHeading.textContent = "PROJECTS";
projectsHeading.style.gridArea = "projectTitle";
mainGrid.appendChild(projectsHeading);


for(let i = 0; i < links.length; i++)

{links[i].pushToScreen()}


let projects = [];

projects.push(new project("Rocketry Camera Mounts"));//-----------------------------
projects.at(-1).cover = "images/robot3.jpg"
projects.at(-1).addDescription("Developed a mounting system for three exterior rocket cameras","a really cool robot");

projects.at(-1).addImage("robot1.jpg");
projects.at(-1).addImage("robot2.jpg");
projects.at(-1).addImage("robot3.jpg");
projects.at(-1).addImage("robot2.jpg");
projects.at(-1).addModel("DownCam10.glb");
projects.at(-1).addModel("DownCam10.glb");

projects.at(-1).captions.push("Mounting Part for the Downward facing camer including machined componet as well as 3D printed shell portion");
projects.at(-1).captions.push("Part for the Canard facing Camera including 3D printed shell");
projects.at(-1).captions.push("the third robot picture");
projects.at(-1).captions.push("the last robot picture");
projects.at(-1).captions.push("the first robot picture");
projects.at(-1).captions.push("the second robot picture");

projects.at(-1).mediaTitles.push("Pic 1");
projects.at(-1).mediaTitles.push("Pic 2");
projects.at(-1).mediaTitles.push("Pic 3");
projects.at(-1).mediaTitles.push("Pic 4");
projects.at(-1).mediaTitles.push("Pic 5");
projects.at(-1).mediaTitles.push("Pic 6");
projects.at(-1).mediaTitles.push("Pic 7");




projects.push(new project("WatBotics Robotic Hand"));//-----------------------------
projects.at(-1).cover = "images/robot3.jpg";


projects.push(new project("Block Stacker Robot"));//-----------------------------
projects.at(-1).cover = "images/blockStacker1.jpg";

projects.at(-1).addImage("blockStacker1.jpg");
projects.at(-1).addImage("blockStacker2.jpg");


for(let i = 0; i < projects.length; i++)

{

    projects[i].pushToScreen();

}

const experienceHeading = document.createElement("h1");
experienceHeading.className = "sectionHeading";
experienceHeading.textContent = "EXPERIENCE";
experienceHeading.style.gridArea = "experienceTitle";
mainGrid.appendChild(experienceHeading);

const experienceArea = document.createElement("div");
experienceArea.className = "experienceContainer";
mainGrid.appendChild(experienceArea); 

let experiences = [];

experiences.push(new experience("Waterloo Rocketry"));
experiences[0].logoUrl = "waterloo-rocketry.png";
experiences[0].dateText = "december to march"; 
experiences[0].link = "https://www.waterloorocketry.com/"; 
experiences[0].pushToScreen();

experiences.push(new experience("WatBotics"));
experiences[1].logoUrl = "City-Of-Oshawa-Logo.svg";
experiences[1].dateText = "June 2022 - January 2026"; 
experiences[1].link = "https://www.linkedin.com/company/watbotics/posts/?feedView=all"; 
experiences[1].pushToScreen();

experiences.push(new experience("City of Oshawa"));
experiences[2].logoUrl = "City-Of-Oshawa-Logo-dark.svg";
experiences[2].dateText = "June 2022 - January 2026"; 
experiences[2].link = "https://www.oshawa.ca/explore-play/recreation/assistance-and-support/inclusion-services/";
experiences[2].description = `
<b>Inclusion Camp Counsellor</b><br>                                                             
•	Individually provided personal care for over 30 children with special needs, handling medical, feeding, and other personal protocols,<br>
•	Collaborated with other staff and families to provide the best possible standard of care for over all participants,<br>
•	 Individually provided personal care for child with special needs, handling medical, feeding, and other personal protocols<br>
•	Buzz words in all points (efficiency, organized, effective, etc.)<br>
•	Add numbers<br><br>

<b>Program Leader</b><br>
•	Planned and lead engaging and skill building 10-week recreational programs to the satisfactions. (Why)<br>
•	Collaborated with small teams of under 5 staff to develop and pilot new city programs such as NERF and VOLT, creating new programs for the municipality.<br><br>

<b>Facility Supervisor</b><br>                      
•	Supervised a 18,770 m2 recreational facility aiding staff and patrons, ensuring all programs ran smoothly.<br>
•	Monitored attendance for drop-in programs and distributed swim safety wristbands.  -> add more<br>
•	Responded to incident situations such as medical emergencies, patron conflicts, vandalisms, and thefts, ensuring patron safety/satisfaction and proper documentation.<br>
`
 
experiences[2].pushToScreen();

const educationHeading = document.createElement("h1");
educationHeading.className = "sectionHeading";
educationHeading.textContent = "EDUCATION";
educationHeading.style.gridArea = "educationTitle";
mainGrid.appendChild(educationHeading);

const educationArea = document.createElement("div");
educationArea.className = "educationContainer";
mainGrid.appendChild(educationArea);

const educationBox = document.createElement("div");
educationBox.className = "educationBox";
educationArea.appendChild(educationBox);

const certificationContainer = document.createElement("div");
certificationContainer.className = "certificationContainer";
educationArea.appendChild(certificationContainer);

const solidWorksBox = document.createElement("div");
certificationContainer.className = "certificationBox";
certificationContainer.appendChild(solidWorksBox);



changeDayNight();

