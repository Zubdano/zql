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


class CompositeProcessor(Processor):
    """
    Processes a list of processors, returning the output from the last one.
    """

    def __init__(self, processors):
        """
        @param processors: list of processors to process.
        """
        self.processors = processors

    def process(self, data):
        """
        Pipes the data through the processors in order.

        @param data: input data to the processor.
        @return: output from the last processor.
        """
        return functools.reduce(lambda data, proc: proc.process(data), self.processors, data)
