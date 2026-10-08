import { Skill, SkillAlias } from '../models/index.js';
import { Op } from 'sequelize';

const COMMON_ABBREVIATIONS = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'ml': 'machine learning',
  'ai': 'artificial intelligence',
  'dl': 'deep learning',
  'dsa': 'data structures & algorithms',
  'k8s': 'kubernetes',
  'docker': 'docker',
  'reactjs': 'react',
  'react.js': 'react',
  'react js': 'react',
  'nodejs': 'node.js',
  'node.js': 'node.js',
  'node js': 'node.js',
  'cpp': 'c++',
  'c#': 'c#',
  'golang': 'go',
  'postgres': 'postgresql',
  'sql': 'sql',
  'ecg': 'ecg interpretation',
  'ekg': 'ecg interpretation',
  'mri': 'radiology',
  'ct': 'radiology',
  'peds': 'pediatrics',
  'er': 'emergency medicine'
};

export const normalizeSkillName = (name) => {
  if (!name || typeof name !== 'string') return '';
  let cleaned = name.toLowerCase().trim().replace(/\s+/g, ' ');
  return cleaned;
};

export const slugify = (name) => {
  if (!name) return '';
  let s = name.toLowerCase().trim();
  s = s.replace(/\+/g, 'p').replace(/#/g, 'sharp');
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s;
};

/**
 * Checks if a requested skill name already exists as a canonical skill or an alias.
 * Returns duplicate detection information and suggestions (e.g. "Did you mean JavaScript?").
 */
export const checkDuplicateSkill = async (rawName, domain = null) => {
  if (!rawName || !rawName.trim()) {
    return { isDuplicate: false };
  }

  const query = rawName.trim();
  const normalized = normalizeSkillName(query);

  // 1. Direct Abbreviation lookup
  const mappedAbbr = COMMON_ABBREVIATIONS[normalized];
  if (mappedAbbr) {
    const canonical = await Skill.findOne({
      where: {
        [Op.or]: [
          sequelizeCondition('canonical_name', mappedAbbr),
          sequelizeCondition('normalized_name', mappedAbbr)
        ]
      },
      include: [{ model: SkillAlias, as: 'aliases' }]
    });

    if (canonical) {
      return {
        isDuplicate: true,
        matchedSkill: canonical,
        reason: 'abbreviation',
        suggestion: `Did you mean "${canonical.canonical_name}"? It is already available globally.`
      };
    }
  }

  // 2. Exact match on Canonical Name (case-insensitive)
  const exactCanonical = await Skill.findOne({
    where: {
      canonical_name: { [Op.like]: query }
    },
    include: [{ model: SkillAlias, as: 'aliases' }]
  });

  if (exactCanonical) {
    return {
      isDuplicate: true,
      matchedSkill: exactCanonical,
      reason: 'exact_canonical',
      suggestion: `Skill "${exactCanonical.canonical_name}" already exists in the SkillSwap catalogue.`
    };
  }

  // 3. Exact match on Normalized Name
  const normalizedCanonical = await Skill.findOne({
    where: {
      normalized_name: normalized
    },
    include: [{ model: SkillAlias, as: 'aliases' }]
  });

  if (normalizedCanonical) {
    return {
      isDuplicate: true,
      matchedSkill: normalizedCanonical,
      reason: 'normalized_match',
      suggestion: `Skill "${normalizedCanonical.canonical_name}" matches your request.`
    };
  }

  // 4. Exact match on Skill Aliases
  const aliasMatch = await SkillAlias.findOne({
    where: {
      [Op.or]: [
        { alias: { [Op.like]: query } },
        { normalized_alias: normalized }
      ]
    },
    include: [{ model: Skill }]
  });

  if (aliasMatch && aliasMatch.Skill) {
    return {
      isDuplicate: true,
      matchedSkill: aliasMatch.Skill,
      reason: 'alias_match',
      suggestion: `"${query}" is a recognized alias for canonical skill "${aliasMatch.Skill.canonical_name}".`
    };
  }

  // 5. Substring / fuzzy prefix checks
  const partialCanonical = await Skill.findOne({
    where: {
      [Op.or]: [
        { canonical_name: { [Op.like]: `%${query}%` } },
        { normalized_name: { [Op.like]: `%${normalized}%` } }
      ]
    }
  });

  if (partialCanonical) {
    return {
      isDuplicate: false, // not an exact duplicate, but provide suggestion
      potentialMatch: partialCanonical,
      suggestion: `Similar skill "${partialCanonical.canonical_name}" already exists. Did you mean that instead?`
    };
  }

  return { isDuplicate: false };
};

const sequelizeCondition = (field, val) => {
  return { [field]: { [Op.like]: val } };
};

export default {
  normalizeSkillName,
  slugify,
  checkDuplicateSkill
};
