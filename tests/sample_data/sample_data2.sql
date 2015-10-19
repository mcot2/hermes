INSERT INTO event_types
VALUES
	(1,'system-maintenance','audit','Audit required');

INSERT INTO event_types
VALUES
	(2,'system-maintenance','needed','This system needs maintenance.');

INSERT INTO event_types
VALUES
	(3,'system-maintenance','ready','This is ready for maintenance.');

INSERT INTO event_types
VALUES
	(4,'system-maintenance','completed','System maintenance completed.');

INSERT INTO event_types
VALUES
	(5,'system-reboot','needed','System reboot required.');

INSERT INTO event_types
VALUES
	(6,'system-reboot','completed','System has rebooted.');

INSERT INTO event_types
VALUES
	(7,'puppet','restart','Puppet has restarted.');

INSERT INTO fates
VALUES
	(1,1,null, 0, 1, 'Audit the system.');

INSERT INTO fates
VALUES
	(2,2,1, 0, 1, 'Reboot, release the system, or authorize downtime.');

INSERT INTO fates
VALUES
	(3,3,2, 1, 0, 'Maintenance is needed so machine must be made ready.');

INSERT INTO fates
VALUES
	(4,4,3, 0, 1, 'System is ready for maintenance might need work done.');

INSERT INTO fates
VALUES
	(5,6,2, 0, 1, 'Maintenance is needed but a reboot might work.');

INSERT INTO fates
VALUES
	(6,5, NULL, 0, 1, 'Reboot the system.');

INSERT INTO fates
VALUES
	(7,6, 6, 0, 1, 'Reboot the system.');

INSERT INTO fates
VALUES
	(8,7,7, 0, 1, 'Reboot was completed so puppet must be restarted.');

INSERT INTO hosts
    VALUES (1, 'example.dropbox.com');

INSERT INTO hosts
    VALUES (2, 'sample.dropbox.com');

INSERT INTO hosts
    VALUES (3, 'test.dropbox.com');