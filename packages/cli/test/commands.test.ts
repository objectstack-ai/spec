import { describe, it, expect } from 'vitest';
import Compile from '../src/commands/compile';
import Serve from '../src/commands/serve';
import Dev from '../src/commands/dev';
import Doctor from '../src/commands/doctor';
import Create from '../src/commands/create';
import Test from '../src/commands/test';
import Validate from '../src/commands/validate';
import Init from '../src/commands/init';
import Info from '../src/commands/info';
import Generate from '../src/commands/generate';
import Lint from '../src/commands/lint';
import Diff from '../src/commands/diff';
import Explain from '../src/commands/explain';
import Studio from '../src/commands/studio';
import PluginList from '../src/commands/plugin/list';
import PluginInfo from '../src/commands/plugin/info';
import PluginAdd from '../src/commands/plugin/add';
import PluginRemove from '../src/commands/plugin/remove';
import PluginBuild from '../src/commands/plugin/build';
import PluginValidate from '../src/commands/plugin/validate';
import PluginPublish from '../src/commands/plugin/publish';
import V2ToV3 from '../src/commands/codemod/v2-to-v3';

describe('CLI Commands (oclif)', () => {
  it('should have compile command', () => {
    expect(Compile.description).toContain('Compile');
  });

  it('should have serve command', () => {
    expect(Serve.description).toContain('server');
  });

  it('should have dev command', () => {
    expect(Dev.description).toContain('development mode');
  });

  it('should have doctor command', () => {
    expect(Doctor.description).toContain('health');
  });

  it('should have create command', () => {
    expect(Create.description).toContain('Create');
  });

  it('should have test command', () => {
    expect(Test.description).toContain('Quality Protocol');
  });

  it('should have validate command', () => {
    expect(Validate.description).toContain('Validate');
  });

  it('should have init command', () => {
    expect(Init.description).toContain('Initialize');
  });

  it('should have info command', () => {
    expect(Info.description).toContain('summary');
  });

  it('should have generate command with alias', () => {
    expect(Generate.aliases).toContain('g');
    expect(Generate.description).toContain('Generate');
  });

  it('should have lint command', () => {
    expect(Lint.description).toContain('style');
  });

  it('should have diff command', () => {
    expect(Diff.description).toContain('Compare');
  });

  it('should have explain command', () => {
    expect(Explain.description).toContain('explanation');
  });

  it('should have studio command', () => {
    expect(Studio.description).toContain('Studio');
  });

  it('should have codemod v2-to-v3 command', () => {
    expect(V2ToV3.description).toContain('v2');
  });

  describe('Plugin subcommands', () => {
    it('should have plugin list command', () => {
      expect(PluginList.description).toContain('List');
    });

    it('should have plugin info command', () => {
      expect(PluginInfo.description).toContain('information');
    });

    it('should have plugin add command', () => {
      expect(PluginAdd.description).toContain('Add');
    });

    it('should have plugin remove command', () => {
      expect(PluginRemove.description).toContain('Remove');
    });

    it('should have plugin remove alias', () => {
      expect(PluginRemove.aliases).toContain('plugin rm');
    });

    it('should have plugin list alias', () => {
      expect(PluginList.aliases).toContain('plugin ls');
    });

    it('should have plugin build command', () => {
      expect(PluginBuild.description).toContain('Build');
    });

    it('should have plugin build alias', () => {
      expect(PluginBuild.aliases).toContain('plugin pack');
    });

    it('should have plugin validate command', () => {
      expect(PluginValidate.description).toContain('Validate');
    });

    it('should have plugin publish command', () => {
      expect(PluginPublish.description).toContain('Publish');
    });
  });
});
