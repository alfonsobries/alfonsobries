import axios from "axios";
import {
  ResumeProject,
  ResumeExperience,
  ResumeSkill,
} from "../interfaces/resume";
import { FilteredPost, Post, PostProperties } from "../interfaces/post";
import markdownToHtml from "./markdownToHtml";
import { Project } from "../interfaces/project";
import { LocaleCode } from "../interfaces/localization";
export const Api = axios.create({
  baseURL: process.env.API_URL || "https://api.alfonsobries.test/api",
});

const USERNAME = "alfonsobries";

const getPostWithOnlyProperties = (
  post: Post,
  properties: PostProperties = [],
  locale: LocaleCode
): FilteredPost => {
  const newPost: FilteredPost = {
    slugs: post.slug as unknown as Record<LocaleCode, string>,
  };

  properties.forEach((property) => {
    console.log({ property });
    if (
      typeof post[property] === "object" &&
      post[property] !== null &&
      post[property][locale] !== undefined
    ) {
      newPost[property] = post[property][locale];
    } else {
      newPost[property] = post[property];
    }
  });

  return newPost;
};

export async function getPostBySlug(
  slug: string,
  properties: PostProperties = [],
  locale: LocaleCode
): Promise<FilteredPost> {
  const { data: post } = await Api.get(`/articles/${slug}`, {
    headers: {
      "Accept-Language": locale,
    },
  });

  return getPostWithOnlyProperties(post, properties, locale);
}

export async function getDraftPostBySlug(
  slug: string,
  secretPath: string,
  properties: PostProperties = [],
  locale: LocaleCode
): Promise<FilteredPost> {
  const { data: post } = await Api.get(`/${secretPath}/articles/${slug}`, {
    headers: {
      "Accept-Language": locale,
    },
  });

  return getPostWithOnlyProperties(post, properties, locale);
}

export async function getAllPosts(
  properties: PostProperties = [],
  params: {
    all?: boolean;
    limit?: number;
    page?: number;
  },
  locale: LocaleCode
) {
  const queryString =
    params === undefined
      ? ""
      : "?" +
        Object.keys(params)
          .map((key) => `${key}=${params[key]}`)
          .join("&");

  const { data: posts } = await Api.get(`/articles${queryString}`);

  if (params.all) {
    return posts.map((post) =>
      getPostWithOnlyProperties(post, properties, locale)
    );
  }

  return {
    ...posts,
    data: posts.data.map((post) => {
      return getPostWithOnlyProperties(post, properties, locale);
    }),
  };
}

export async function getSlugs() {
  const { data: posts } = await Api.get(`/articles?all=true`);

  return posts.map((post) => post.slug);
}

export async function getAllDraftPostsSlugs(secretPath: string) {
  const { data: slugs } = await Api.get(`/${secretPath}/articles/slugs`);

  return slugs;
}

const parseExperience = async (experience: ResumeExperience) => {
  const formattedDescription = await markdownToHtml(experience.description);

  return {
    ...experience,
    description: formattedDescription,
  };
};
const parseResumeProject = async (project: ResumeProject) => {
  const formattedDescription = await markdownToHtml(project.description);

  return {
    ...project,
    description: formattedDescription,
  };
};

export async function getResumeData() {
  const {
    data,
  }: {
    data: {
      experience: ResumeExperience[];
      projects: ResumeProject[];
      skills: ResumeSkill[];
    };
  } = await Api.get("/resume");

  const experience = await Promise.all(
    data.experience.map(async (item) => {
      return parseExperience(item);
    })
  );

  const projects = await Promise.all(
    data.projects.map(async (item) => {
      return parseResumeProject(item);
    })
  );

  const skills = data.skills;

  return { experience, projects, skills };
}

const parseProject = async (project: Project) => {
  const formattedDescription = await markdownToHtml(project.description);

  return {
    ...project,
    description: formattedDescription,
  };
};

export async function getProjects() {
  const {
    data,
  }: {
    data: Project[];
  } = await Api.get("/projects");

  const projects = await Promise.all(
    data.map(async (item) => {
      return parseProject(item);
    })
  );

  return projects;
}

enum ContributionLevel {
  FIRST_QUARTILE = "FIRST_QUARTILE",
  FOURTH_QUARTILE = "FOURTH_QUARTILE",
  NONE = "NONE",
  SECOND_QUARTILE = "SECOND_QUARTILE",
  THIRD_QUARTILE = "THIRD_QUARTILE",
}

type ContributionDay = {
  color: string;
  contributionLevel: ContributionLevel;
  contributionCount: number;
  date: string;
  weekday: number;
};

type ContributionWeeks = {
  contributionDays: ContributionDay[];
  firstDay: string;
}[];

const parseGithubContributions = (weeks: ContributionWeeks) => {
  const months = weeks.reduce(
    (acc, week) => {
      const firstDay = new Date(week.firstDay);

      const month = new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        1
      ).getTime();

      const groupedByDayOfWeek = week.contributionDays.reduce(
        (acc, day) => {
          acc[day.weekday] = day;
          return acc;
        },
        {} as {
          [key: number]: ContributionDay;
        }
      );

      if (!acc[month]) {
        acc[month] = [];
      }

      acc[month].push(groupedByDayOfWeek);

      return acc;
    },
    {} as {
      [key: number]: any[];
    }
  );

  // Sorts by key date
  return Object.keys(months)
    .sort((a, b) => Number(a) - Number(b))
    .reduce(
      (acc, key) => {
        acc[Number(key)] = months[Number(key)];

        return acc;
      },
      {} as {
        [key: number]: any[];
      }
    );
};

export async function getGithubContributions() {
  const headers = {
    Authorization: `bearer ${process.env.GITHUB_API_KEY}`,
  };
  const body = {
    query: `query {
          user(login: "${USERNAME}") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    color
                    contributionLevel,
                    contributionCount
                    date
                    weekday
                  }
                  firstDay
                }
              }
            }
          }
        }`,
  };

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    body: JSON.stringify(body),
    headers: headers,
  });

  const { data } = await response.json();

  return parseGithubContributions(
    data.user.contributionsCollection.contributionCalendar.weeks
  );
}
