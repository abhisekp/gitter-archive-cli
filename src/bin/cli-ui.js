import vorpal from 'vorpal';
import _ from 'lodash/fp';

const cli = vorpal();

// cli.hide();

cli
  .command('run')
  .action(function (args, cb) {
    cli.show();
    this.log('Running app');
    cb();
  });


cli
  .command('fetch <group> [groups...]')
  .option('-A, --archive', 'Archive all rooms in the group')
  .action(function (args, cb) {
    const groups = _.compact(_.concat(args.group, args.groups));
    this.log(groups);
    cb();
  }); 

cli.delimiter('gitter-archive$ ').parse(process.argv);

export {
  cli,
};
