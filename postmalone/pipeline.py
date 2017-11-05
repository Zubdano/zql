import abc
import functools


class Processor(object):
    """
    Base class for processors, objects that take some input from a previous processor,
    process it, and pass some output to another processor.
    """

    __metaclass__ = abc.ABCMeta

    @abc.abstractmethod
    def process(self, data):
        """
        Implement to process the data and produce some output.
        """
        raise NotImplementedError()


def run_processors(processors, data):
    """
    Runner for a pipeline of processors. Some input data is passed into the pipeline,
    it is then processed by each of the processors, and the output from the last
    last processor is returned.

    @param processors: list of processor objects
    @return: output from processors
    """
    return functools.reduce(lambda data, proc: proc.process(data), processors, data)
